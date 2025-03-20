'use client'

import { useState } from 'react';
import Link from 'next/link';
import {
    AiOutlineUser,
    AiOutlineCompass,
    AiOutlineLineChart,
    AiOutlineLock,
    AiOutlineDesktop,
    AiOutlineHistory,
    AiOutlineDelete,
    AiOutlineMenu,
    AiOutlineClose, AiOutlineHome, AiOutlineMessage,
} from 'react-icons/ai';

// Navigation items grouped by category
const navigationItems = [
    // {
    //     category: 'Profile',
    //     items: [
    //         { href: '/edit-profile', icon: <AiOutlineUser className="h-5 w-5 text-brown-600" />, label: 'Edit Profile' }
    //     ]
    // },
    // {
    //     category: 'Spheres',
    //     items: [
    //         { href: '/avatar-sphere', icon: <AiOutlineUser className="h-5 w-5 text-brown-600" />, label: 'Avatar Sphere' },
    //         { href: '/exploration-sphere', icon: <AiOutlineCompass className="h-5 w-5 text-brown-600" />, label: 'Exploration Sphere' },
    //         { href: '/progress-sphere', icon: <AiOutlineLineChart className="h-5 w-5 text-brown-600" />, label: 'Progress Sphere' }
    //     ]
    // },
    // {
    //     category: 'Secure',
    //     items: [
    //         { href: '/password', icon: <AiOutlineLock className="h-5 w-5 text-brown-600" />, label: 'Password' },
    //         { href: '/access', icon: <AiOutlineDesktop className="h-5 w-5 text-brown-600" />, label: 'Access' },
    //         { href: '/sessions', icon: <AiOutlineHistory className="h-5 w-5 text-brown-600" />, label: 'Sessions' },
    //         { href: '/delete-account', icon: <AiOutlineDelete className="h-5 w-5 text-brown-600" />, label: 'Delete account' }
    //     ]
    // }
    {
        category: 'Home',
        items: [
            { href: '/home', icon: <AiOutlineHome className="h-5 w-5 text-brown-600" />, label: 'Home Page' }
        ]
    },
    {
        category: 'Chat',
        items: [
            { href: '/generate_response', icon: <AiOutlineMessage className="h-5 w-5 text-brown-600" />, label: 'Chat with Alethia' }
        ]
    },

];

// Navigation item component
const NavItem = ({ href, icon, label }) => (
    <li>
        <Link
            href={href}
            className="flex items-center space-x-2 py-2 px-4 rounded hover:bg-gray-200"
        >
            {icon}
            <span className="text-brown-700">{label}</span>
        </Link>
    </li>
);

// Category component
const Category = ({ title, children }) => (
    <>
        <li>
            <span className="text-brown-800 font-semibold">{title}</span>
        </li>
        {children}
    </>
);

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-20 p-2 bg-[#A1EDE4] rounded-md shadow-md"
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
            >
                {isOpen ? <AiOutlineClose className="h-6 w-6 text-white" /> : <AiOutlineMenu className="h-6 w-6 text-white" />}
            </button>

            {/* Sidebar Panel */}
            <aside
                className={`fixed top-0 left-0 h-full bg-[#D2E4EE] w-64 transition-transform duration-300 transform rounded-r-lg ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } z-10`}
            >
                {/* Header */}
                <div className="p-4 mt-15">
                    <h1 className="text-2xl font-semibold text-[#453823]">AlethioSphere</h1>
                </div>

                {/* Navigation */}
                <nav>
                    <ul className="space-y-2 p-4 text-[#453823]">
                        {navigationItems.map((section, index) => (
                            <Category key={index} title={section.category}>
                                {section.items.map((item, itemIndex) => (
                                    <NavItem
                                        key={itemIndex}
                                        href={item.href}
                                        icon={item.icon}
                                        label={item.label}
                                    />
                                ))}
                            </Category>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
