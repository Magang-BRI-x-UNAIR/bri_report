"use client";

import React, { useState, useRef, useEffect } from "react";

interface TooltipProps {
    children: React.ReactElement;
    content: React.ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    side = "top",
    delay = 300,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const tooltipRef = useRef<HTMLDivElement>(null);
    const childRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    useEffect(() => {
        if (isVisible && childRef.current && tooltipRef.current) {
            const childRect = childRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            let top = 0;
            let left = 0;

            switch (side) {
                case "top":
                    top = childRect.top - tooltipRect.height - 8;
                    left =
                        childRect.left +
                        childRect.width / 2 -
                        tooltipRect.width / 2;
                    break;
                case "right":
                    top =
                        childRect.top +
                        childRect.height / 2 -
                        tooltipRect.height / 2;
                    left = childRect.right + 8;
                    break;
                case "bottom":
                    top = childRect.bottom + 8;
                    left =
                        childRect.left +
                        childRect.width / 2 -
                        tooltipRect.width / 2;
                    break;
                case "left":
                    top =
                        childRect.top +
                        childRect.height / 2 -
                        tooltipRect.height / 2;
                    left = childRect.left - tooltipRect.width - 8;
                    break;
            }

            setPosition({ top, left });
        }
    }, [isVisible, side]);

    return (
        <>
            {React.cloneElement(children, {
                onMouseEnter: handleMouseEnter,
                onMouseLeave: handleMouseLeave,
                ref: childRef,
            })}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    className="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm"
                    style={{
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                    }}
                >
                    {content}
                </div>
            )}
        </>
    );
};
