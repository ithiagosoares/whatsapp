"use client"

import { useState, useEffect } from "react"
import { Upload, ExternalLink, MessageCircle, Save, LogIn, LogOut, CheckCircle, Loader2, QrCode } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { doc, type User } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { getFunctions, httpsCallable } from "firebase/functions"

import { useUser, useFirestore, useMemoFirebase } from "@/firebase/provider"
import { useDoc } from "@/firebase/firestore/use-doc"
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates"

declare global {
  interface Window {
    FB: any;
  }
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { user: authUser } = useUser()
  const firestore = useFirestore()
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  // User Profile State
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [profilePic, setProfilePic] = useState("https://picsum.photos/seed/user/100/100")

  // Company State
  const [clinicName, setClinicName] = useState("Clínica VitalLink")
  const [address, setAddress] = useState("Rua das Flores, 123, São Paulo, SP")
  const [cnpj, setCnpj] = useState("12.345.678/0001-90")
  const [contactEmail, setContactEmail] = useState("contato@vitallink.com")
  const [dpoContact, setDpoContact] = useState("dpo@vitallink.com")
  const [allowConsentExport, setAllowConsentExport] = useState(true)
  const [retentionPeriod, setRetentionPeriod] = useState("5")
  
  // WhatsApp State
  const [whatsAppStatus, setWhatsAppStatus] = useState<'disconnected' | 'loading' | 'qrcode' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState('');
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!authUser) return null;
    return doc(firestore, `users/${authUser.uid}`);
  }, [firestore, authUser]);

  const { data: userData } = useDoc<User>(userDocRef);

  useEffect(() => {
    if (userData) {
      if (userData.name) {
        const nameParts = userData.name.split(' ');
        setFirstName(nameParts[0] || "");
        setLastName(nameParts.slice(1).join(' ') || "");
      }
      setEmail(userData.email || "");
      if(userData.whatsappApiToken) { // We'll adapt this logic
        setWhatsAppStatus('connected');
        setIsWhatsAppConnected(true);
      } else {
        setWhatsAppStatus('disconnected');
        setIsWhatsAppConnected(false);
      }
    }
  }, [userData]);


  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePic(URL.createObjectURL(file))
    }
  }

  const handleSaveProfile = () => {
    if (!userDocRef) return;
    const name = `${firstName} ${lastName}`.trim();
    setDocumentNonBlocking(userDocRef, { name, email }, { merge: true });
    toast({
        title: "Configurações salvas!",
        description: `As alterações da seção Perfil foram salvas com sucesso.`
    })
  }
  
  const handleWhatsAppConnect = async () => {
    if (!authUser) {
      toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
      return;
    }
    setWhatsAppStatus('loading');
    setQrCode('');

    try {
      const response = await fetch(`/api/whatsapp/start-session?userId=${authUser.uid}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao iniciar a sessão do WhatsApp.');
      }
      
      const data = await response.json();

      if (data.qrCode) {
        setQrCode(data.qrCode);
        setWhatsAppStatus('qrcode');
      } else {
        // Handle cases where it might connect without a QR code (e.g., session restored)
        setWhatsAppStatus('connected');
        setIsWhatsAppConnected(true);
      }

    } catch (error: any) {
      console.error("Error starting WhatsApp session:", error);
      setWhatsAppStatus('disconnected');
      toast({
        variant: "destructive",
        title: "Erro de Conexão",
        description: error.message || "Não foi possível gerar o QR Code. Tente novamente.",
      });
    }
  };

  const handleWhatsAppDisconnect = () => {
    if (!userDocRef) return;
    // Here you would also call an API endpoint to terminate the session on the backend
    setDocumentNonBlocking(userDocRef, { whatsappApiToken: "" }, { merge: true }); // Placeholder
    setWhatsAppStatus('disconnected');
    setIsWhatsAppConnected(false);
    toast({
      variant: "default",
      title: "Desconectado!",
      description: "Sua conta do WhatsApp foi desconectada.",
    });
  };

  const plans = [
    {
        id: "trial",
        name: "Trial",
        price: "Grátis",
        priceDescription: "por 14 dias",
        features: ["200 mensagens/mês", "1 usuário", "Funcionalidades básicas"],
        isCurrent: (userData as any)?.plan === "Trial",
    },
    {
        id: "professional",
        name: "Profissional",
        price: "R$ 99",
        priceDescription: "/mês",
        priceId: "price_1SMqjoEEZjNwuQwBIEAKUGgi",
        features: ["5.000 mensagens/mês", "Até 3 usuários", "Suporte via E-mail"],
        isCurrent: (userData as any)?.plan === "Profissional",
    },
    {
        id: "enterprise",
        name: "Empresa",
        price: "Contato",
        priceDescription: "personalizado",
        features: ["Mensagens ilimitadas", "Usuários ilimitados", "Suporte dedicado"],
        isCurrent: (userData as any)?.plan === "Empresa",
    }
  ]

  const handlePlanAction = async (planId: string, priceId: string | null | undefined) => {
    // This is a placeholder for actual Stripe integration logic
    if (planId === 'enterprise') {
      toast({ title: "Entre em Contato", description: "Por favor, entre em contato com nossa equipe de vendas para planos empresariais." });
      return;
    }
    
    setIsSubmitting(planId);
    
    // Placeholder for Stripe checkout logic
    setTimeout(() => {
        if (priceId) {
          toast({
              title: `Redirecionando para pagamento do plano ${planId}`,
              description: `Price ID: ${priceId}`
          })
        } else {
           toast({
              title: `Ação para o plano ${planId}`
          })
        }
        setIsSubmitting(null)
    }, 2000)
  };


  return (
    <>
      <PageHeader title="Configurações" />
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 max-w-3xl">
          <TabsTrigger value="account">Conta</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="whatsapp" data-tour-id="whatsapp-tab">WhatsApp API</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="payment">Pagamento</TabsTrigger>
          <TabsTrigger value="policy">LGPD</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>
                Atualize as informações da sua conta e seu e-mail.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Foto de Perfil</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profilePic} alt="User profile" />
                    <AvatarFallback>{firstName.charAt(0)}{lastName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button asChild variant="outline">
                    <label htmlFor="profile-pic-upload" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Alterar Foto
                    </label>
                  </Button>
                  <input id="profile-pic-upload" type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">Nome</Label>
                  <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Sobrenome</Label>
                  <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input id="password" type="password" placeholder="Deixe em branco para não alterar" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>Gerencie as informações da sua clínica ou consultório.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="clinic-name">Nome da Clínica</Label>
                    <Input id="clinic-name" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ/CPF</Label>
                    <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contact-email">E-mail de Contato</Label>
                        <Input id="contact-email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dpo-contact">Contato do DPO</Label>
                        <Input id="dpo-contact" type="email" value={dpoContact} onChange={(e) => setDpoContact(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-4 border-t pt-6">
                    <h3 className="text-lg font-medium">Privacidade</h3>
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label htmlFor="allow-export">Permitir exportação de logs de consentimento</Label>
                            <p className="text-xs text-muted-foreground">Permite que administradores exportem relatórios de consentimento.</p>
                        </div>
                        <Switch id="allow-export" checked={allowConsentExport} onCheckedChange={setAllowConsentExport} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="retention-period">Período de retenção de dados</Label>
                        <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
                            <SelectTrigger id="retention-period" className="max-w-xs">
                                <SelectValue placeholder="Selecione um período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 ano</SelectItem>
                                <SelectItem value="2">2 anos</SelectItem>
                                <SelectItem value="5">5 anos</SelectItem>
                                <SelectItem value="10">10 anos</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">A VitalLink salva os logs de consentimento por {retentionPeriod} anos, a menos que uma exclusão seja solicitada.</p>
                    </div>
                     <Link href="/privacy" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                        Ver nossa Política de Privacidade <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => toast({ title: "Em desenvolvimento", description: "Esta funcionalidade ainda não foi implementada."})}>Salvar Alterações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Integração com WhatsApp</CardTitle>
              <CardDescription>
                Conecte sua conta do WhatsApp para automatizar o envio de mensagens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {whatsAppStatus === 'connected' && (
                    <Alert variant="default" className="border-green-500 bg-green-50 text-green-900">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 font-semibold">Conectado!</AlertTitle>
                        <AlertDescription>
                            Sua conta do WhatsApp está configurada e pronta para enviar mensagens.
                        </AlertDescription>
                    </Alert>
                )}
                 {whatsAppStatus === 'disconnected' && (
                    <Alert variant="destructive" className="border-amber-500 bg-amber-50 text-amber-900">
                        <MessageCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-amber-800 font-semibold">Ação Necessária</AlertTitle>
                        <AlertDescription>
                           Para enviar mensagens, você precisa conectar sua conta do WhatsApp.
                        </AlertDescription>
                    </Alert>
                )}

                {whatsAppStatus === 'loading' && (
                  <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Gerando QR Code, aguarde...</p>
                  </div>
                )}

                {whatsAppStatus === 'qrcode' && qrCode && (
                   <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted rounded-lg">
                      <h3 className="text-lg font-semibold text-center">Escaneie para Conectar</h3>
                      <p className="text-sm text-muted-foreground text-center max-w-xs">Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie o código abaixo.</p>
                      <div className="bg-white p-4 rounded-lg shadow-md">
                        <Image src={qrCode} alt="QR Code do WhatsApp" width={256} height={256} />
                      </div>
                   </div>
                )}
            </CardContent>
            <CardFooter>
                {isWhatsAppConnected ? (
                    <Button onClick={handleWhatsAppDisconnect} variant="destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        Desconectar
                    </Button>
                ) : (
                   <Button onClick={handleWhatsAppConnect} disabled={whatsAppStatus === 'loading' || whatsAppStatus === 'qrcode'}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Conectar WhatsApp
                    </Button>
                )}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="plans">
            <Card>
                <CardHeader>
                    <CardTitle>Planos e Assinatura</CardTitle>
                    <CardDescription>Escolha o plano que melhor se adapta às suas necessidades. Você pode alterar ou cancelar a qualquer momento.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={cn("flex flex-col", plan.isCurrent && "border-primary border-2")}>
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription className="h-12">
                                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                                    <span className="text-muted-foreground"> {plan.priceDescription}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3">
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className={cn("w-full", !plan.isCurrent && plan.id === 'professional' && "bg-teal-500 hover:bg-teal-600")}
                                    variant={plan.isCurrent ? 'outline' : 'default'}
                                    disabled={plan.isCurrent || isSubmitting === plan.id}
                                    onClick={() => handlePlanAction(plan.id, (plan as any).priceId)}
                                >
                                    {isSubmitting === plan.id ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Aguarde...</>
                                    ) : plan.isCurrent ? 'Plano Atual' : plan.id === 'enterprise' ? 'Entrar em Contato' : 'Fazer Upgrade'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="payment">
            <Card>
                <CardHeader>
                    <CardTitle>Informações de Pagamento</CardTitle>
                    <CardDescription>Gerencie seus métodos de pagamento e histórico de faturas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Método de Pagamento</Label>
                        <div className="border rounded-lg p-4 flex justify-between items-center">
                            <p>Nenhum método de pagamento cadastrado.</p>
                            <Button variant="outline" disabled>Gerenciar no Portal</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Histórico de Faturas</Label>
                        <div className="border rounded-lg p-8 text-center text-muted-foreground">
                            <p>Nenhuma fatura encontrada.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="policy">
            <Card>
                <CardHeader>
                    <CardTitle>Política de Dados e LGPD</CardTitle>
                    <CardDescription>Informações sobre como seus dados são tratados.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <p>Nós levamos a sua privacidade a sério. Todos os dados dos pacientes são criptografados e armazenados de forma segura.</p>
                    <p>Você tem o direito de solicitar a exportação ou exclusão de seus dados a qualquer momento, em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
                    <div className="flex gap-4 pt-4">
                        <Button variant="outline">Exportar Meus Dados</Button>
                        <Button variant="destructive">Excluir Minha Conta</Button>
                    </div>
                </CardContent>
                 <CardFooter>
                    <a href="#" className="text-sm text-primary hover:underline">Leia nossa Política de Privacidade completa</a>
                </CardFooter>
            </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
