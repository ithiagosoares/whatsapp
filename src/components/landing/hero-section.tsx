"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const trustPoints = [
    "Cancelamento simples",
    "Dados 100% seguros",
    "Sem risco, teste grátis",
  ];

  return (
    <section className="w-full py-8 md:py-12 lg:py-16 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl lg:text-6xl/none xl:text-7xl/[1.1] text-gray-900">
              Encha a agenda da sua clínica com <span className="bg-gradient-to-r from-[#00B3A4] to-[#05326D] bg-clip-text text-transparent">lembretes automáticos</span> pelo WhatsApp 📲
            </h1>
            <p className="max-w-[600px] text-gray-600 md:text-xl mx-auto lg:mx-0">
              O lembrete inteligente que aumenta o <span className="bg-gradient-to-r from-[#00B3A4] to-[#05326D] bg-clip-text text-transparent font-medium">retorno</span> da sua clínica odontológica.
            </p>

            <div className="flex flex-col items-center lg:items-start gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-[#00B3A4] to-[#05326D] text-white font-semibold hover:shadow-lg hover:brightness-110 transition-all duration-300">
                  <Link href="/signup">
                    Quero aumentar meus retornos
                  </Link>
                </Button>
                <p className="text-xs text-gray-500">
                    Sem cartão de crédito • Configuração em 5 minutos
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 mt-2">
                    {trustPoints.map((point) => (
                    <div key={point} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>{point}</span>
                    </div>
                    ))}
                </div>
            </div>
          </div>
          
          <div className="relative flex items-center justify-center lg:min-h-[600px] mt-8 lg:mt-0">
             <Image
                alt="Fundo com brilho gradiente"
                className="absolute top-1/2 left-1/2 w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 -z-10 opacity-50 blur-3xl"
                aria-hidden="true"
                src="https://firebasestorage.googleapis.com/v0/b/studio-296644579-18969.firebasestorage.app/o/Ellipse%202.svg?alt=media&token=e4b6008a-9288-4501-9b74-13a8374d7310"
                width="700"
                height="700"
            />
            <Image
                alt="Imagem de um iPhone mostrando a interface do aplicativo"
                className="relative mx-auto rounded-xl object-contain lg:max-w-md w-full max-w-xs sm:max-w-sm"
                height="602"
                src="https://firebasestorage.googleapis.com/v0/b/studio-296644579-18969.firebasestorage.app/o/tudo.svg?alt=media&token=8520000e-3a71-4b97-9fc3-0721d3201a8d"
                width="361"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
