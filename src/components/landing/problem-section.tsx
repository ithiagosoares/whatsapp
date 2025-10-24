"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TrendingDown, CircleDollarSign, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export function ProblemSection() {
    const problems = [
        { 
            icon: TrendingDown,
            title: "30% a 50% dos pacientes esquecem retornos",
            description: "Sem lembretes automáticos, a taxa de no-show dispara"
        },
        { 
            icon: CircleDollarSign,
            title: "Cada paciente perdido = R$ 500 a R$ 2.000/ano a menos",
            description: "Receita que simplesmente evapora por falta de organização"
        },
        { 
            icon: Clock,
            title: "Equipes gastam horas em contatos manuais",
            description: "Tempo valioso desperdiçado em tarefas que não escalam"
        },
    ];

  return (
    <section className="w-full py-10 lg:py-16 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900">
            Você está <span className="text-problem-red">perdendo pacientes</span> sem nem perceber.
          </h2>
          <p className="mt-4 text-gray-600 md:text-lg">
            Todos os meses, centenas de clínicas e consultórios deixam pacientes sumirem no silêncio. Não é porque eles não gostaram do atendimento. Não é porque não precisam mais de cuidados.
          </p>
           <p className="mt-2 text-gray-700 md:text-lg">
            👉 É simplesmente porque <span className="font-bold">ninguém lembrou eles de voltar.</span>
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
           <div className="relative flex items-center justify-center lg:order-1">
             <Image
                alt="Fundo com brilho gradiente"
                className="absolute inset-0 w-full h-full object-contain opacity-75 blur-3xl"
                aria-hidden="true"
                src="https://firebasestorage.googleapis.com/v0/b/studio-296644579-18969.firebasestorage.app/o/Ellipse%202.svg?alt=media&token=e4b6008a-9288-4501-9b74-13a8374d7310"
                width="600"
                height="600"
            />
            <Image
                alt="Interior de uma clínica moderna"
                className="relative mx-auto rounded-xl object-cover shadow-xl"
                height="450"
                width="600"
                src="https://firebasestorage.googleapis.com/v0/b/studio-296644579-18969.firebasestorage.app/o/clinic.svg?alt=media&token=4e2800b9-2a1b-426e-81d8-226afbbbdc31"
                data-ai-hint="clinic interior"
            />
          </div>
            
          <div className="space-y-6 lg:order-2">
            {problems.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-problem-red/10 text-problem-red rounded-full p-2.5">
                        <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <p className="text-gray-600">{item.description}</p>
                    </div>
                </div>
            ))}

            <div className="bg-problem-red/10 border-l-4 border-problem-red p-4 rounded-r-lg">
                <div className="flex">
                    <div className="py-1">
                        <AlertTriangle className="h-5 w-5 text-problem-red mr-3" />
                    </div>
                    <div>
                        <p className="text-sm text-problem-red-dark">
                            Enquanto você perde tempo com burocracia, seus concorrentes estão ocupando o espaço que deveria ser seu.
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-xl text-gray-800 !mt-8">
                O problema não é falta de pacientes. <br/>
                <span className="font-bold bg-gradient-to-r from-primary to-[#05326D] bg-clip-text text-transparent">É falta de follow-up.</span>
            </p>

          </div>
        </div>

        <div className="text-center mt-16">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-[#05326D] text-white font-semibold hover:shadow-lg hover:brightness-110 transition-all duration-300">
              <Link href="/signup">
                Quero aumentar meus retornos
              </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}