'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { isAuthenticated, getCurrentUser } from '@/app/(auth)/client-jwt';
import { useRouter } from 'next/navigation';

export default function HomepageContent() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [quote, setQuote] = useState("The journey of a thousand miles begins with a single step.");

    // Quotes for the quote box - could be fetched from an API in the future
    const quotes = [
        "The journey of a thousand miles begins with a single step.",
        "Write hard and clear about what hurts.",
        "In the journal I do not just express myself more openly than I could to any person; I create myself.",
        "Journal writing is a voyage to the interior.",
        "Keep a diary, and someday it'll keep you.",
    ];

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        // Get current user
        const currentUser = getCurrentUser();
        setUser(currentUser);

        // Set a random quote
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
    }, [router]);

    const handleStartConversation = () => {
        router.push('/chat');
    };

    const handleViewPreviousSessions = () => {
        router.push('/sessions');
    };

    if (!user) {
        return <div className="min-h-screen bg-[#55DBCB] flex justify-center items-center">
            <div className="animate-pulse text-[#453823] text-xl">Loading...</div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#55DBCB] to-[#189195] font-[PoppinsFont]">
            {/* Header/Navigation */}
            <nav className="bg-[#55DBCB] shadow-md w-full z-10 p-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-[#453823] text-xl font-bold">AlethioSphere</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-[#453823]">Hello, {user?.name || 'there'}!</span>
                            <button
                                onClick={() => router.push('/profile')}
                                className="text-[#453823] hover:bg-[#189195] hover:text-white px-3 py-2 rounded-md font-medium transition-colors"
                            >
                                Profile
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12 flex flex-col items-center">
                {/* Welcome Section */}
                <div className="text-center mb-12 text-[#233855]">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4 text-[#453823]">
                        Welcome Back, <span className="text-[#233855]">{user?.name?.split(' ')[0] || 'Friend'}!</span>
                    </h1>
                    <p className="text-2xl md:text-4xl text-[#453823] mt-4">
                        I'm here for anything you want to tell me!
                    </p>
                </div>

                {/* Quote Box with enhanced styling */}
                <div className="bg-[#A1EDE4] border-4 border-[#25BEAC] p-8 rounded-lg mb-12 w-full max-w-2xl shadow-xl transform hover:scale-105 transition-transform duration-300 relative">
                    <div className="absolute -top-4 -left-4 bg-[#E5A134] text-[#453823] py-1 px-3 rounded-lg shadow-md text-sm font-bold">
                        Today's Inspiration
                    </div>
                    <h2 className="text-2xl text-[#233855] text-center font-semibold mb-2">
                        "Quote of the Day"
                    </h2>
                    <p className="text-[#233855] text-lg italic text-center">
                        {quote}
                    </p>
                </div>

                {/* Action Buttons with improved styling */}
                <div className="flex flex-col sm:flex-row justify-center gap-6 w-full max-w-2xl">
                    <button
                        onClick={handleStartConversation}
                        className="bg-[#453823] hover:bg-[#2A1E0A] text-white font-bold py-4 px-8 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#E5A134] transition duration-300 flex-1 transform hover:-translate-y-1 shadow-lg"
                    >
                        Start a new conversation
                    </button>
                    <button
                        onClick={handleViewPreviousSessions}
                        className="bg-[#453823] hover:bg-[#2A1E0A] text-white font-bold py-4 px-8 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#E5A134] transition duration-300 flex-1 transform hover:-translate-y-1 shadow-lg"
                    >
                        View Previous sessions
                    </button>
                </div>

                {/* Feature Highlights */}
                <div className="mt-20 w-full max-w-4xl">
                    <h2 className="text-3xl font-bold mb-8 text-center text-[#453823]">How Alethia Can Help You Today</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-[#189195]/20 backdrop-filter backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-bold mb-3 text-[#E5A134]">Process Emotions</h3>
                            <p className="text-[#233855]">Talk through complex feelings and gain emotional clarity with supportive conversation.</p>
                        </div>
                        <div className="bg-[#189195]/20 backdrop-filter backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-bold mb-3 text-[#E5A134]">Daily Reflection</h3>
                            <p className="text-[#233855]">Build a habit of daily journaling to promote mindfulness and personal growth.</p>
                        </div>
                        <div className="bg-[#189195]/20 backdrop-filter backdrop-blur-sm p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                            <h3 className="text-xl font-bold mb-3 text-[#E5A134]">Meaningful Conversation</h3>
                            <p className="text-[#233855]">Engage in thoughtful dialog that helps you process your thoughts and experiences.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-[#233855] text-white p-6 mt-12">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-sm">© {new Date().getFullYear()} AlethioSphere - Your AI companion for personal journaling</p>
                    <div className="mt-2">
                        <a href="#" className="text-gray-300 hover:text-white transition-colors mx-2 text-sm">Privacy Policy</a>
                        <a href="#" className="text-gray-300 hover:text-white transition-colors mx-2 text-sm">Terms of Service</a>
                        <a href="#" className="text-gray-300 hover:text-white transition-colors mx-2 text-sm">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}