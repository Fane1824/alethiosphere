import textToSpeech from "@google-cloud/text-to-speech";
import fs from "fs";
import path from "path";

// Google Cloud TTS Client
const credentials = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "google-credentials.json"), "utf8")
);
const client = new textToSpeech.TextToSpeechClient({ credentials });

// Reliable lip sync generation that properly uses all four mouth shapes
function generateLipSyncFromAudio(audioContent) {
  // Create a buffer from the audio content
  const buffer = Buffer.from(audioContent);
  
  // Get audio duration from buffer size
  // Google TTS uses LINEAR16 encoding (16-bit PCM, mono, 24kHz)
  const bytesPerSample = 2; // 16-bit = 2 bytes per sample
  const channels = 1; // Mono
  const sampleRate = 24000; // 24kHz is standard for Google TTS
  
  // Calculate audio length in seconds (excluding 44-byte WAV header)
  const dataLength = buffer.length - 44;
  const audioLengthSeconds = dataLength / (bytesPerSample * channels * sampleRate);
  
  console.log(`Audio length: ${audioLengthSeconds.toFixed(2)} seconds`);
  console.log(`Buffer size: ${buffer.length} bytes`);
  
  // Frame rate for lip sync
  const framesPerSecond = 24;
  const totalFrames = Math.ceil(audioLengthSeconds * framesPerSecond);
  const frameDuration = 1 / framesPerSecond;
  
  console.log(`Generating ${totalFrames} lip sync frames`);
  
  // First pass: collect all energy values to determine thresholds
  const energyValues = [];
  const samplesPerFrame = Math.floor((buffer.length - 44) / totalFrames);
  
  for (let i = 0; i < totalFrames; i++) {
    const startByte = 44 + (i * samplesPerFrame);
    const endByte = Math.min(startByte + samplesPerFrame, buffer.length);
    
    let energy = 0;
    for (let j = startByte; j < endByte; j += 2) {
      if (j + 1 < endByte) {
        // Convert two bytes to a 16-bit sample
        const sample = buffer[j] | (buffer[j + 1] << 8);
        energy += Math.abs(sample);
      }
    }
    
    // Average energy for this frame
    const frameSize = (endByte - startByte) / 2; // Number of 16-bit samples
    energy = frameSize > 0 ? energy / frameSize : 0;
    energyValues.push(energy);
  }
  
  // Sort energy values to determine adaptive thresholds
  const sortedEnergy = [...energyValues].sort((a, b) => a - b);
  
  // Use percentiles for adaptive thresholds
  const silenceThreshold = sortedEnergy[Math.floor(sortedEnergy.length * 0.25)]; // 25th percentile
  const lowThreshold = sortedEnergy[Math.floor(sortedEnergy.length * 0.5)];      // 50th percentile 
  const mediumThreshold = sortedEnergy[Math.floor(sortedEnergy.length * 0.75)];  // 75th percentile
  
  console.log(`Energy thresholds: silence=${silenceThreshold}, low=${lowThreshold}, medium=${mediumThreshold}`);
  
  const lipSyncData = [];
  
  // Second pass: assign mouth shapes based on adaptive thresholds
  for (let i = 0; i < totalFrames; i++) {
    const energy = energyValues[i];
    
    // Base assignment using energy thresholds
    let mouthShape;
    if (energy < silenceThreshold) {
      mouthShape = "B"; // Closed mouth for silence
    } else if (energy < lowThreshold) {
      mouthShape = "C"; // Half-open for low energy
    } else if (energy < mediumThreshold) {
      mouthShape = "A"; // Open for medium energy
    } else {
      mouthShape = "D"; // EE shape for high energy
    }
    
    // Add contextual rules to improve realism
    if (i > 0 && i < totalFrames - 1) {
      const prevEnergy = energyValues[i-1];
      const nextEnergy = energyValues[i+1];
      
      // Energy spike followed by decrease often indicates plosive sounds (p, b, t, d)
      if (energy > prevEnergy * 1.5 && energy > nextEnergy * 1.5) {
        mouthShape = "D"; // "EE" shape works well for plosives
      }
      
      // In periods of sustained medium energy, mix in some variation
      if (Math.abs(energy - prevEnergy) < energy * 0.1 &&
          Math.abs(energy - nextEnergy) < energy * 0.1) {
        // Add some variety every few frames during sustained sounds
        if (i % 3 === 0 && mouthShape === "A") {
          mouthShape = "D"; // Occasional "EE" shape
        } else if (i % 5 === 0 && mouthShape === "A") {
          mouthShape = "C"; // Occasional half-open
        }
      }
    }
    
    // Add to lip sync data
    lipSyncData.push({
      start: i * frameDuration,
      end: (i + 1) * frameDuration,
      value: mouthShape
    });
  }
  
  // Post-processing to reduce jitter
  for (let i = 1; i < lipSyncData.length - 1; i++) {
    const prev = lipSyncData[i - 1];
    const current = lipSyncData[i];
    const next = lipSyncData[i + 1];
    
    // If surrounded by two frames of the same shape, conform to them
    if (prev.value === next.value && current.value !== prev.value) {
      current.value = prev.value;
    }
  }
  
  // Make sure we have adequate distribution of all mouth shapes
  let shapeCounts = {A: 0, B: 0, C: 0, D: 0};
  lipSyncData.forEach(frame => shapeCounts[frame.value]++);
  console.log("Initial mouth shape distribution:", shapeCounts);
  
  // Force minimum counts for each shape if needed
  const targetMinimum = Math.max(2, Math.floor(totalFrames * 0.05)); // At least 5% of frames or 2 frames
  
  for (const shape of ["A", "C", "D"]) {
    if (shapeCounts[shape] < targetMinimum) {
      console.log(`Adding more "${shape}" shapes to meet minimum`);
      let added = 0;
      for (let i = 5; i < lipSyncData.length - 5 && added < targetMinimum; i += 4) {
        if (lipSyncData[i].value !== shape && 
            lipSyncData[i-1].value !== shape && 
            lipSyncData[i+1].value !== shape) {
          lipSyncData[i].value = shape;
          added++;
        }
      }
    }
  }
  
  // Start and end with closed mouth
  if (lipSyncData.length > 0) {
    lipSyncData[0].value = "B";
    lipSyncData[lipSyncData.length - 1].value = "B";
  }
  
  // Count final shape distribution
  shapeCounts = {A: 0, B: 0, C: 0, D: 0};
  lipSyncData.forEach(frame => shapeCounts[frame.value]++);
  console.log("Final mouth shape distribution:", shapeCounts);
  
  return { mouthCues: lipSyncData };
}

export async function POST(req) {
  const data = await req.json();
  const text = data.text;

  // Return early if no text provided
  if (!text || text.trim() === "") {
    return new Response(JSON.stringify({ success: false, error: "Text required" }), { status: 400 });
  }

  const outputAudioPath = path.join(process.cwd(), "public", "audio", "audio.wav");
  const outputJsonPath = path.join(process.cwd(), "public", "data", "lipSync.json");

  try {
    // Step 1: Generate speech from text (WAV format)
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: "en-US", ssmlGender: "FEMALE" },
      audioConfig: { audioEncoding: "LINEAR16" },
    });

    // Step 2: Save the TTS-generated file
    await fs.promises.writeFile(outputAudioPath, response.audioContent);
    console.log("✅ TTS audio saved.");

    // Step 3: Generate lip sync data
    console.time("Lip sync generation");
    const lipSyncData = generateLipSyncFromAudio(response.audioContent);
    console.timeEnd("Lip sync generation");
    
    // Step 4: Save the lip sync JSON
    await fs.promises.writeFile(outputJsonPath, JSON.stringify(lipSyncData));
    console.log("✅ Fast lip sync generated.");

    return new Response(JSON.stringify({success: true}), {status: 200});
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({success: false, error: error.message}), {status: 500});
  }
}