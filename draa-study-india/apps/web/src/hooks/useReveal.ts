import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useReveal(){const {pathname}=useLocation();useEffect(()=>{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const items=Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));items.forEach((item,index)=>{item.classList.add("reveal-ready");item.style.setProperty("--delay",`${Math.min(index%4,3)*55}ms`)});const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add("revealed");observer.unobserve(entry.target)}),{threshold:.12,rootMargin:"0px 0px -7%"});items.forEach(item=>observer.observe(item));return()=>observer.disconnect()},[pathname])}
