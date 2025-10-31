
'use client';

import { useState } from 'react';
import { useAuth } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleWhatsAppConnect = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: 'Você precisa estar logado para conectar o WhatsApp.',
      });
      return;
    }

    setIsLoading(true);
    setQrCode(null);

    const backendUrl = process.env.NEXT_PUBLIC_WHATSAPP_BACKEND_URL;

    if (!backendUrl) {
      toast({
        variant: 'destructive',
        title: 'Erro de Configuração',
        description: 'A URL do backend do WhatsApp não foi configurada.',
      });
      setIsLoading(false);
      return;
    }

    try {
      // Usando o endpoint do novo backend externo
      const response = await fetch(`${backendUrl}/start-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao iniciar a sessão do WhatsApp.');
      }

      const data = await response.json();

      if (data.qrCode) {
        setQrCode(data.qrCode);
        toast({
          title: 'Escaneie o QR Code',
          description: 'Abra o WhatsApp no seu celular e escaneie o código para conectar.',
        });
      }
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Conectar',
        description: error.message || 'Não foi possível gerar o QR Code. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>
      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp API</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Conta</CardTitle>
              <CardDescription>Gerencie os detalhes da sua conta.</CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>UID:</strong> {user.uid}
                  </p>
                </div>
              ) : (
                <p>Carregando informações do usuário...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Conexão com WhatsApp</CardTitle>
              <CardDescription>
                Conecte sua conta do WhatsApp para automatizar o envio de mensagens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleWhatsAppConnect} disabled={isLoading}>
                {isLoading ? 'Gerando QR Code...' : 'Conectar WhatsApp'}
              </Button>

              {isLoading && !qrCode && <p>Aguarde, estamos preparando tudo para você...</p>}

              {qrCode && (
                <div className="mt-4 flex flex-col items-center">
                  <p className="mb-2">Escaneie o código abaixo com seu celular:</p>
                  <Image src={qrCode} alt="QR Code do WhatsApp" width={256} height={256} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
