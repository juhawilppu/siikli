import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '../../lib/translations'
import Footer from '../components/Footer'
import TopBar from '../components/TopBar'

export default function AboutUsPage() {
  const t = useTranslation()

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {t('aboutUs.title')}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-[800px]">
              {t('aboutUs.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold tracking-tight">{t('aboutUs.ourStory')}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  {t('aboutUs.ourStory.siikliWasStartedWhen')}
                </p>
                <p>
                  {t('aboutUs.ourStory.siikliWasUpgradedIn2025')}
                </p>
                <Separator />
                <p>
                  {t('aboutUs.ourStory.myGoal')}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-1/2 bg-gray-100 rounded-lg overflow-hidden">
                <img src="/juha.jpg" alt="Juha Wilppu" className="object-cover w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who */ }
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div className="relative w-1/2 bg-gray-100 rounded-lg overflow-hidden">
                <img src="/juha_personal1.jpg" alt="Juha Wilppu" className="object-cover w-full h-full" />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold tracking-tight">{t('aboutUs.whoIsJuha.title')}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t('aboutUs.whoIsJuha.hi')}</p>
                <p>{t('aboutUs.whoIsJuha.myNameIs')}</p>
                <p>{t('aboutUs.whoIsJuha.iBuildSoftware')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our team - currently hidden */}
      {false && (
        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center gap-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Tekijä</h2>
              <p className="text-muted-foreground text-lg max-w-[800px]">
                Tutustutaan ihmisiin Siiklin takana. Tiimimme koostuu intohimoisista ammattilaisista, jotka ovat
                omistautuneet auttamaan asiakkaitamme menestymään.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Juha Wilppu',
                  title: 'Ohjelmistokehittäjä & perustaja',
                  email: 'juha.wilppu@siikli.fi',
                  bio: 'Juhalla on 13 vuoden kokemus ohjelmistojen suunnittelusta, rakentamisesta ja pyörittämisestä.',
                  image: '/juha4.png',
                },
              ].map((member, i) => (
                <Card key={i} className="bg-white border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-100 relative">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold">{member.name}</h3>
                      <p className="text-sm text-primary">{member.title}</p>
                      <p className="text-sm text-muted-foreground mt-2">{member.bio}</p>
                      <p className="text-sm text-muted-foreground mt-2"><a href={`mailto:${member.email}`}>{member.email}</a></p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our achievements - currently hidden */}
      {false && (
        <section className="w-full py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center gap-4 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Saavutuksemme</h2>
              <p className="text-muted-foreground text-lg max-w-[800px]">
                Olemme ylpeitä matkastamme ja saavutuksistamme tähän mennessä.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative pl-8 border-l-2 border-primary">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold">2017</h3>
                  <p className="text-muted-foreground">Siikli sai alkunsa</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold">2019</h3>
                  <p className="text-muted-foreground">xxx</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold">2020</h3>
                  <p className="text-muted-foreground">xxx</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold">2021</h3>
                  <p className="text-muted-foreground">xxx</p>
                </div>
              </div>
              <div className="relative pl-8 border-l-2 border-primary">
                <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary"></div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold">2022</h3>
                  <p className="text-muted-foreground">xxx</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold">2023</h3>
                  <p className="text-muted-foreground">xxx</p>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold">2024</h3>
                  <p className="text-muted-foreground">
                    xxx
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold">2025</h3>
                  <p className="text-muted-foreground">
                    xxx
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Our location - currently hidden */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">{t('aboutUs.companyDetails.title')}</h2>
            <p className="text-muted-foreground text-lg max-w-[800px]">
              {t('aboutUs.companyDetails.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
            <div>
              {t('aboutUs.companyDetails.company')}
              <br />
              {t('aboutUs.companyDetails.businessId')}
              <br />
              {t('aboutUs.companyDetails.country')}
              <br />
              {t('aboutUs.companyDetails.contact')}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 md:gap-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('aboutUs.doYouWantToBuildWithMe.title')}</h2>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-[800px]">
              {t('aboutUs.doYouWantToBuildWithMe.siikliIsNotCorporate')}
            </p>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-[800px]">
              {t('aboutUs.doYouWantToBuildWithMe.iAmLookingForAPartner')}
            </p>

            <p>
              ✉️
              {' '}
              <a className="text-white-500" href="mailto:juha.wilppu@siikli.fi">juha.wilppu@siikli.fi</a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
