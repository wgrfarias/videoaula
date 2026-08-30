import { getSiteContent, linksToLines, faqToLines } from "@/lib/data/site-content";
import { updateSiteContent } from "@/lib/actions/site-content";
import { Label, Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HeroVideoField } from "@/components/admin/hero-video-field";

export const metadata = { title: "Configurações do site | Admin" };

export default async function AdminSettingsPage() {
  const content = await getSiteContent();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">Conteúdo do site</h1>
      <p className="mt-1 text-sm text-ink-500">
        Tudo aqui aparece direto nas páginas públicas — nome da marca, textos do
        topo, sobre, FAQ e os links de menu, rodapé e redes sociais.
      </p>

      <form action={updateSiteContent} className="mt-8 space-y-8">
        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900">Marca</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="siteName">Nome do site</Label>
              <Input id="siteName" name="siteName" defaultValue={content.siteName} required />
            </div>
            <div>
              <Label htmlFor="siteTagline">Assinatura (abaixo do nome)</Label>
              <Input id="siteTagline" name="siteTagline" defaultValue={content.siteTagline} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900">Topo da home (hero)</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="heroBadgeText">Selo de destaque</Label>
              <Input id="heroBadgeText" name="heroBadgeText" defaultValue={content.heroBadgeText} />
            </div>
            <div>
              <Label htmlFor="heroTitle">Título principal</Label>
              <Textarea id="heroTitle" name="heroTitle" defaultValue={content.heroTitle} />
            </div>
            <div>
              <Label htmlFor="heroSubtitle">Subtítulo</Label>
              <Textarea id="heroSubtitle" name="heroSubtitle" defaultValue={content.heroSubtitle} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="heroPrimaryLabel">Botão principal — texto</Label>
                <Input id="heroPrimaryLabel" name="heroPrimaryLabel" defaultValue={content.heroPrimaryLabel} />
              </div>
              <div>
                <Label htmlFor="heroPrimaryHref">Botão principal — link</Label>
                <Input id="heroPrimaryHref" name="heroPrimaryHref" defaultValue={content.heroPrimaryHref} />
              </div>
              <div>
                <Label htmlFor="heroSecondaryLabel">Botão secundário — texto</Label>
                <Input id="heroSecondaryLabel" name="heroSecondaryLabel" defaultValue={content.heroSecondaryLabel} />
              </div>
              <div>
                <Label htmlFor="heroSecondaryHref">Botão secundário — link</Label>
                <Input id="heroSecondaryHref" name="heroSecondaryHref" defaultValue={content.heroSecondaryHref} />
              </div>
            </div>
            <div>
              <Label htmlFor="heroStatLine">Linha de prova social</Label>
              <Input id="heroStatLine" name="heroStatLine" defaultValue={content.heroStatLine} />
            </div>
            <HeroVideoField defaultValue={content.heroVideoUrl ?? ""} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900">Promoção</h2>
          <p className="mt-1 text-xs text-ink-500">
            Uma promoção do site inteiro aplica o desconto abaixo a todos os
            cursos e combos que não tenham um desconto próprio configurado.
          </p>
          <div className="mt-4 space-y-4">
            <label className="flex items-center gap-2 text-sm font-medium text-ink-700">
              <input
                type="checkbox"
                name="promoActive"
                defaultChecked={content.promoActive}
                className="h-4 w-4 rounded border-ink-300"
              />
              Ativar promoção em todo o site
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="promoGlobalDiscount">Desconto global (%)</Label>
                <Input
                  id="promoGlobalDiscount"
                  name="promoGlobalDiscount"
                  type="number"
                  min={0}
                  max={99}
                  defaultValue={content.promoGlobalDiscount}
                />
              </div>
              <div>
                <Label htmlFor="promoBannerText">Texto do banner de promoção</Label>
                <Input id="promoBannerText" name="promoBannerText" defaultValue={content.promoBannerText} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900">Página &quot;Sobre&quot;</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="aboutTitle">Título</Label>
              <Input id="aboutTitle" name="aboutTitle" defaultValue={content.aboutTitle} />
            </div>
            <div>
              <Label htmlFor="aboutBody">Texto (separe parágrafos com uma linha em branco)</Label>
              <Textarea id="aboutBody" name="aboutBody" defaultValue={content.aboutBody} className="min-h-40" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900">Perguntas frequentes</h2>
          <p className="mt-1 text-xs text-ink-500">
            Uma pergunta por bloco: primeira linha é a pergunta, a(s) linha(s)
            seguinte(s) é a resposta. Separe cada bloco com uma linha em branco.
          </p>
          <Textarea
            name="faqItemsText"
            defaultValue={faqToLines(content.faqItems)}
            className="mt-3 min-h-48 font-mono text-xs"
            placeholder={"Por quanto tempo tenho acesso?\nO acesso é liberado por 365 dias após a compra."}
          />
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900">Links do menu e rodapé</h2>
          <p className="mt-1 text-xs text-ink-500">
            Um link por linha, no formato <code>Rótulo | /caminho-ou-url</code>.
          </p>
          <Textarea
            name="navLinksText"
            defaultValue={linksToLines(content.navLinks)}
            className="mt-3 min-h-32 font-mono text-xs"
            placeholder={"Início | /\nCursos | /cursos"}
          />
        </Card>

        <Card className="p-6">
          <h2 className="font-display font-semibold text-ink-900">Rodapé e redes sociais</h2>
          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="footerTagline">Texto curto do rodapé</Label>
              <Textarea id="footerTagline" name="footerTagline" defaultValue={content.footerTagline} />
            </div>
            <div>
              <Label htmlFor="socialLinksText">
                Redes sociais — uma por linha, no formato <code>Rótulo | url</code>
              </Label>
              <Textarea
                id="socialLinksText"
                name="socialLinksText"
                defaultValue={linksToLines(content.socialLinks)}
                className="min-h-24 font-mono text-xs"
                placeholder={"Instagram | https://instagram.com/seu-usuario"}
              />
            </div>
          </div>
        </Card>

        <Button type="submit" size="lg">
          Salvar alterações
        </Button>
      </form>
    </div>
  );
}
