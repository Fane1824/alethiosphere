'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Landing() {
    const router = useRouter();
    const handleGetStarted = () => {
        router.push('/login');
    }
    const handleTryItOut = () => {
        router.push('/chat');
    }

    return (
        <div className="font-sans">
            {/* Navigation */}
            <nav className="bg-[#55DBCB] shadow-md fixed w-full z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-[#453823] text-xl font-bold">AlethioSphere</span>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <a href="#features" className="text-[#453823] hover:bg-[#189195] hover:text-white px-3 py-2 rounded-md font-medium">Features</a>
                                <button onClick={handleGetStarted} className="bg-[#453823] text-white hover:bg-[#3B290D] px-3 py-2 rounded-md font-medium">Login</button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-[#55DBCB] p-6 pt-20">
                {/* left section */}
                <div className="font-[PoppinsFont] md:w-1/2 text-center md:text-left mb-6 md:mb-0 p-6">
                    <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-[#453823] mb-4 md:mb-10 tracking-tight">Welcome to <span className="text-[#189195]">AlethioSphere!</span></h1>
                    <p className="text-xl md:text-2xl text-[#453823] mb-6 md:mb-10">An AI companion for personal journaling!</p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <button className="bg-[#453823] text-white py-3 px-6 rounded-lg hover:bg-[#3B290D] transition-all duration-300 shadow-lg" onClick={handleGetStarted}>Get Started</button>
                        <button className="bg-transparent border-2 border-[#453823] text-[#453823] py-3 px-6 rounded-lg hover:bg-[#453823] hover:text-white transition-all duration-300" onClick={handleTryItOut}>Try it out</button>
                    </div>
                </div>

                {/* right section */}
                <div className="md:w-1/2 flex justify-center items-center">
                    <div className="relative bg-[#189195] p-3 rounded-lg shadow-xl transform rotate-1 hover:rotate-0 transition-all duration-300">
                        <Image
                            src="/images/landing_page_img.jpg"
                            alt="AI Avatar"
                            width={400}
                            height={500}
                            className="rounded-lg"
                            style={{objectFit: 'cover'}}
                        />
                        <div className="absolute -bottom-4 -right-4 bg-[#E5A134] text-[#453823] py-2 px-4 rounded-lg shadow-md text-sm font-bold">
                            Your Journaling Companion
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="min-h-screen font-[PoppinsFont] bg-gradient-to-b from-[#007B7F] to-[#005557] text-white p-8 md:p-16 flex flex-col justify-baseline">
                <h2 className="text-[#E5A134] text-4xl md:text-6xl font-bold mb-10 text-center md:text-left">Talk To Alethia - Your Virtual Companion</h2>
                <div className="grid md:grid-cols-2 gap-10 mt-10">
                    <div>
                        <p className="text-xl md:text-2xl mb-8 leading-relaxed">
                            Ever felt like you wanted someone to dump your emotions? Meet Alethia,
                            a virtual companion who will accompany you in your journaling habits.
                            Whether it be seeking emotional clarity with regards to anxiety, stress and
                            mental health, or just a simple conversation to take your mind off things on
                            a normal way, Alethia can help you.
                        </p>
                        <button onClick={handleTryItOut} className="mt-4 bg-[#E5A134] text-[#453823] py-3 px-6 rounded-lg hover:bg-[#c48829] transition-all duration-300 font-bold shadow-lg">
                            Start Journaling Now
                        </button>
                    </div>
                    <div className="bg-[#189195]/20 p-6 rounded-lg shadow-lg backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-4 text-[#E5A134]">Key Features</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <span className="mr-2 text-[#E5A134] font-bold">•</span>
                                <span>Personal AI companion that listens to your thoughts</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2 text-[#E5A134] font-bold">•</span>
                                <span>Safe space to express emotions and reflect</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2 text-[#E5A134] font-bold">•</span>
                                <span>Meaningful conversation to help process feelings</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2 text-[#E5A134] font-bold">•</span>
                                <span>Available anytime you need someone to talk to</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#233855] text-white p-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-[#A9A8DF] text-2xl font-bold mb-4">AlethioSphere</h3>
                        <p className="text-gray-300">Your AI companion for personal journaling and emotional wellbeing.</p>
                    </div>
                    <div>
                        <h3 className="text-[#A9A8DF] text-xl font-bold mb-4">Connect</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Email Us</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Support</a></li>
                            <li><a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-[#A9A8DF] text-xl font-bold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-300 hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="text-gray-300 hover:text-white transition-colors">Instagram</a>
                            <a href="#" className="text-gray-300 hover:text-white transition-colors">LinkedIn</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}