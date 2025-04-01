'use client'

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Clock, ShoppingBag } from "lucide-react";

// Static target date 
const TARGET_DATE = new Date('2025-04-01');

// Function to calculate the time remaining 
const calculateTimeRemaining = (targetDate: Date) => {
    const currentTime = new Date();
    const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0);
    return {
        days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
    };
}

const DealCountdown = () => {
    const [time, setTime] = useState<ReturnType<typeof calculateTimeRemaining>>();

    useEffect(() => {
        // Calculate initial time on client
        setTime(calculateTimeRemaining(TARGET_DATE));

        const timerInterval = setInterval(() => {
            const newTime = calculateTimeRemaining(TARGET_DATE);
            setTime(newTime);

            if (newTime.days === 0 && newTime.hours === 0 && newTime.minutes === 0 && newTime.seconds === 0) {
                clearInterval(timerInterval);
            }
        }, 1000);

        return () => clearInterval(timerInterval);
    }, []);

    if (!time) {
        return (
            <section className="my-24 brand-pattern bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-pulse flex flex-col items-center">
                            <Clock size={48} className="text-gray-400 mb-4" />
                            <h3 className="text-3xl font-bold text-gray-400">Loading Countdown...</h3>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0) {
       return (
            <section className="my-24 brand-pattern bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-6">
                            <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full w-16 h-16 mb-2">
                                <Clock size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold">Deal Has Ended</h3>
                            <p className="text-gray-600 text-lg">
                                This deal has ended. Check back soon for new deals and promotions!
                            </p>
                            
                            <div className="mt-4">
                                <Button asChild className="bg-black hover:bg-gray-800 text-white px-6 py-6 rounded-none">
                                    <Link href='/search' className="flex items-center">
                                        View Products
                                        <ShoppingBag className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <div className="relative w-full h-80 overflow-hidden rounded-lg shadow-xl">
                                <Image 
                                    src='/images/promo.jpg' 
                                    alt='promotional image' 
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
       ) 
    }

    return (
        <section className="my-24 brand-pattern bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="flex flex-col gap-6">
                        <div className="inline-flex items-center justify-center p-4 bg-black rounded-full w-16 h-16 mb-2">
                            <Clock size={24} className="text-white" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold">Deal of the month</h3>
                        <p className="text-gray-600 text-lg">
                            Get ready for a shopping experience like never before with our
                            Deals of the month! Every purchase comes with exclusive perks and 
                            offers, making this month a celebration of savvy choices and 
                            amazing deals.
                        </p>
                        <div className="flex flex-wrap justify-between gap-4 mt-4">
                            <TimeBox label="Days" value={time.days} />
                            <TimeBox label="Hours" value={time.hours} />
                            <TimeBox label="Minutes" value={time.minutes} />
                            <TimeBox label="Seconds" value={time.seconds} />
                        </div>
                        <div className="mt-6">
                            <Button asChild className="bg-black hover:bg-gray-800 text-white px-6 py-6 rounded-none">
                                <Link href='/search' className="flex items-center">
                                    Shop Now
                                    <ShoppingBag className="ml-2 w-4 h-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="relative w-full h-80 overflow-hidden rounded-lg shadow-xl">
                            <Image 
                                src='/images/promo.jpg' 
                                alt='promotional image' 
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const TimeBox = ({ label, value }: { label: string, value: number; }) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center w-20 h-20">
        <span className="text-2xl font-bold">{value < 10 ? `0${value}` : value}</span>
        <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
    </div>
)
 
export default DealCountdown;