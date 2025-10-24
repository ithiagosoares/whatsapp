"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="w-full py-20 lg:py-24 bg-gradient-to-r from-primary to-[#05326D]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
                Sua <span className="text-primary">agenda cheia</span> começa <span className="text-primary">hoje.</span>
              </h2>
              <div className="flex justify-center md:justify-start">
                 <Button asChild size="lg" className="bg-gradient-to-r from-primary to-[#05326D] text-white font-semibold hover:shadow-lg hover:brightness-110 transition-all duration-300">
                    <Link href="/signup">
                        Quero aumentar meus retornos
                    </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
                <Image
                    alt="Ilustração 3D de balões de chat"
                    className="mx-auto object-contain"
                    height="250"
                    width="250"
                    src="https://firebasestorage.googleapis.com/v0/b/studio-296644579-18969.firebasestorage.app/o/mensagem.svg?alt=media&token=0ac8575d-1f95-496f-893b-4917d2a73583"
                    data-ai-hint="message bubble"
                />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}