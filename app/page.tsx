import Link from "next/link"
import { Bricolage_Grotesque, Space_Grotesk } from "next/font/google"
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Layers3,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Stethoscope,
  Workflow,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { SectionHeading } from "@/components/landing/section-heading"
import { ServiceCard } from "@/components/landing/service-card"
import { ImpactCard } from "@/components/landing/impact-card"
import { TestimonialCard } from "@/components/landing/testimonial-card"
import { SystemCarousel } from "@/components/landing/system-carousel"

const headingFont = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
})

const bodyFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

const benefits = [
  "Onboarding guiado: clinica primero, admin despues",
  "Agenda publica e interna con control multi-sucursal",
  "Expediente clinico progresivo con historial y consulta",
]

const productPillars = [
  "Dashboard operativo",
  "Citas internas y publicas",
  "Pacientes e historial",
  "Consulta medica",
  "Cola del doctor en tiempo real",
  "Control de sucursales",
  "Horarios disponibles inteligentes",
  "Gestion por roles del equipo",
]

const mvpNow = [
  "Recepcion con control de cancelaciones por ventana de tiempo",
  "Agenda interna y portal publico de citas sincronizados",
  "Gestion de especialidades por sucursal con activacion/desactivacion",
  "Bitacora operativa para auditoria de cambios en citas",
]

const roadmapNext = [
  "Recordatorios automaticos por WhatsApp y correo",
  "Pagos, anticipos y politicas de no-show",
  "Reportes ejecutivos de conversion y ocupacion por sucursal",
  "Portal paciente para confirmar, reprogramar y cancelar por autoservicio",
]

const services = [
  {
    icon: <CalendarCheck2 className="size-5" />,
    title: "Agenda clinica robusta",
    description: "Combina agendamiento publico e interno con validaciones reales de disponibilidad.",
    points: [
      "Endpoint de horarios disponibles por sucursal",
      "Control de traslapes y cupo por doctores activos",
      "Estados de cita para flujo recepcion-doctor",
    ],
  },
  {
    icon: <Activity className="size-5" />,
    title: "Expediente medico progresivo",
    description: "Desde la primera cita se construye la ficha del paciente sin frenar la operacion.",
    points: [
      "Alta automatica de paciente en flujo publico",
      "Historial clinico editable por rol autorizado",
      "Consulta medica con diagnostico, receta y notas",
    ],
  },
  {
    icon: <Workflow className="size-5" />,
    title: "Operacion multi-clinica",
    description: "Segrega datos por clinica y sucursal para escalar sin perder control.",
    points: [
      "Control independiente para cada clinica y sucursal",
      "Notificaciones en tiempo real para cola del doctor",
      "Visibilidad de operacion para direccion y coordinacion",
    ],
  },
]

const impactItems = [
  {
    value: "Menos cancelaciones",
    title: "Agenda mas confiable",
    description:
      "Se evita sobrecupo y cruces de horario, reduciendo errores que afectan la experiencia del paciente.",
  },
  {
    value: "Mayor productividad",
    title: "Capacidad real por sede",
    description:
      "Cada sucursal opera segun su disponibilidad real para atender mas pacientes sin saturar al equipo.",
  },
  {
    value: "Operacion fluida",
    title: "Equipo mejor coordinado",
    description:
      "Recepcion y doctor comparten estado de cola y avance clinico durante la jornada.",
  },
]

const systemSlides = [
  {
    badge: "Dashboard Administracion",
    title: "Panel administrativo completo",
    subtitle: "Vista ejecutiva con metricas clave, estado de clinica, sucursales y actividad del equipo en tiempo real.",
    imageSrc: "/system/Dashboard_Adminstracion.png",
    imageAlt: "Captura del dashboard de administracion",
  },
  {
    badge: "Dashboard Recepcion",
    title: "Centro de operaciones de recepcion",
    subtitle: "La recepcionista gestiona citas del dia, estados de pacientes y cola activa desde un solo panel.",
    imageSrc: "/system/Dashboard_resepcion.png",
    imageAlt: "Captura del dashboard de recepcion",
  },
  {
    badge: "Vista Calendario",
    title: "Calendario de citas por dia",
    subtitle: "Vista temporal de todas las citas agendadas con colores por estado: pendiente, presente, en consulta y completada.",
    imageSrc: "/system/Calendario.png",
    imageAlt: "Captura del calendario de citas",
  },
  {
    badge: "Administracion de Citas",
    title: "Gestion completa de appointments",
    subtitle: "Crea, edita, cancela y filtra citas internas con control de horarios disponibles y validacion de traslapes.",
    imageSrc: "/system/Vista_appointment.png",
    imageAlt: "Captura de la vista de appointments",
  },
  {
    badge: "Lista de Trabajadores",
    title: "Control de personal y roles",
    subtitle: "Adminsitracion del equipo clinico: doctores, recepcionistas y roles con permisos diferenciados por sucursal.",
    imageSrc: "/system/Vista_Lista_Trabajadores.png",
    imageAlt: "Captura de la lista de trabajadores",
  },
  {
    badge: "Gestion de Sucursales",
    title: "Operacion multi-sucursal",
    subtitle: "Configura cada sede con sus horarios, especialidades activas y personal asignado desde un panel unificado.",
    imageSrc: "/system/Vistas_Sucursales.png",
    imageAlt: "Captura de la vista de sucursales",
  },
  {
    badge: "Panel Doctor",
    title: "Vista medica en tiempo real",
    subtitle: "El doctor visualiza su cola de pacientes, historial previo y registra diagnostico, receta y notas de consulta.",
    imageSrc: "/system/Panel_doctor.png",
    imageAlt: "Captura del panel del doctor",
  },
]

const testimonials = [
  {
    quote:
      "Pasamos de trabajar con hojas y mensajes a un flujo unico. El equipo ahora sabe que hacer en cada etapa.",
    name: "Dra. Karla Mendez",
    role: "Directora Medica",
    clinic: "Centro Clinico Nova Salud",
  },
  {
    quote:
      "La creacion de clinica y cuenta admin fue muy clara. En el primer dia ya estabamos agendando sin friccion.",
    name: "Luis Fernando Ortega",
    role: "Administrador",
    clinic: "Unidad Medica Horizonte",
  },
  {
    quote:
      "Tenemos mejor control de horarios y menos cancelaciones por errores operativos. El impacto fue inmediato.",
    name: "Maria Isabel Rios",
    role: "Coordinadora de Operaciones",
    clinic: "Clinica Vital Care",
  },
]

const faqItems = [
  {
    question: "Como empieza el flujo de acceso inicial?",
    answer:
      "Desde la landing, el boton principal te lleva al onboarding donde primero registras la clinica y luego creas la cuenta administradora.",
  },
  {
    question: "Que modulos funcionales ya tiene Clynic hoy?",
    answer:
      "Actualmente incluye dashboard, citas (publicas e internas), pacientes, historial clinico, consulta medica, sucursales, servicios, perfiles y panel de doctor.",
  },
  {
    question: "Como manejan la sobre-reserva de horarios?",
    answer:
      "El sistema protege la agenda para evitar sobrecupo y cruces, mostrando solo opciones que realmente se pueden atender.",
  },
  {
    question: "El sistema sirve para una o varias sucursales?",
    answer:
      "Esta pensado para crecer contigo. Puedes iniciar con una sede y luego agregar nuevas sucursales, personal y horarios.",
  },
  {
    question: "Como se construye el expediente del paciente?",
    answer:
      "Se trabaja con registro progresivo: primero agendamiento, luego consulta y actualizacion de historial clinico con antecedentes, alergias, medicamentos y observaciones.",
  },
  {
    question: "Como impacta en ingresos y experiencia del paciente?",
    answer:
      "Al ordenar agenda, reducir errores y acelerar atencion, la clinica atiende mas casos por jornada con mejor experiencia para el paciente.",
  },
  {
    question: "Puedo mostrar mis propias capturas en la landing?",
    answer:
      "Si. Dejamos una zona de carrusel lista para que reemplaces facilmente los placeholders por imagenes reales del sistema.",
  },
]

export default function LandingPage() {
  return (
    <main className={`${bodyFont.className} landing-shell`}>
      <div className="landing-gradient" aria-hidden="true" />

      <header className="landing-topbar">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <div className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-slate-900">
            <div className="rounded-xl bg-slate-900 p-2 text-white">
              <Stethoscope className="size-4" />
            </div>
            CLYNIC SYSTEM
          </div>
          <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-700 lg:flex">
            <a href="#servicios" className="landing-nav-link">Servicios</a>
            <a href="#impacto" className="landing-nav-link">Impacto</a>
            <a href="#testimonios" className="landing-nav-link">Testimonios</a>
            <a href="#faq" className="landing-nav-link">FAQ</a>
            <a href="#contacto" className="landing-nav-link">Contacto</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="landing-cta-secondary px-3 py-2 text-xs sm:text-sm">
              Ingresar
            </Link>
            <Link href="/auth/login?onboarding=1" className="landing-cta-primary px-3 py-2 text-xs sm:text-sm">
              Empezar ahora
            </Link>
          </div>
        </div>
      </header>

      <section id="hero" className="landing-section mx-auto grid min-h-[calc(100dvh-4.5rem)] w-full max-w-6xl items-center gap-10 px-6 pb-14 pt-28 md:grid-cols-2 md:px-10 md:pt-32">
        <div className="relative z-10 space-y-7">
          <div className="landing-pill reveal-1">
            <Stethoscope className="size-4" />
            SaaS para centros clinicos privados
          </div>

          <h1 className={`${headingFont.className} reveal-2 text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl md:text-6xl`}>
            De operacion manual a una clinica conectada y medible.
          </h1>

          <p className="reveal-3 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Clynic integra agenda, pacientes, consulta medica e historial clinico en un solo flujo.
            Comienzas en minutos: primero creas clinica, luego cuenta administradora y entras al panel.
          </p>

          <div className="reveal-4 flex flex-wrap items-center gap-3">
            <Link href="/auth/login?onboarding=1" className="landing-cta-primary">
              Adquirir sistema
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/auth/login" className="landing-cta-secondary">
              Ya tengo cuenta
            </Link>
          </div>

          <div className="reveal-5 grid gap-2 pt-1">
            {benefits.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle2 className="size-4 text-sky-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="relative z-10 reveal-card">
          <div className="landing-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Clynic System</p>
                <h2 className={`${headingFont.className} mt-2 text-2xl font-bold text-slate-900`}>
                  Plataforma lista para operar
                </h2>
              </div>
              <div className="rounded-2xl bg-slate-900 p-3 text-white">
                <Building2 className="size-6" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="landing-step">
                <span>1</span>
                Crear clinica
              </div>
              <div className="landing-step">
                <span>2</span>
                Crear cuenta administrador
              </div>
              <div className="landing-step">
                <span>3</span>
                Operar citas, pacientes y consulta
              </div>
            </div>

            <div className="landing-feature-stack mt-6">
              <div className="landing-feature-card">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Resultado</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Menos caos operativo en recepcion y consulta</p>
              </div>
              <div className="landing-feature-card">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Beneficio</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Mejor experiencia para paciente y equipo clinico</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section id="producto" className="landing-section relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <SectionHeading
          eyebrow="Producto desarrollado"
          title="MVP hoy + roadmap de crecimiento"
          description="El MVP ya controla el ciclo de citas y operacion clinica; ademas ya tenemos definido lo que sigue para escalar ventas y experiencia paciente."
        />

        <div className="mt-8 flex flex-wrap gap-2">
          {productPillars.map((item) => (
            <span key={item} className="landing-feature-pill">
              <Sparkles className="size-3.5" />
              {item}
            </span>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="landing-kpi-card">
            <Clock3 className="size-5 text-sky-700" />
            <p className="text-2xl font-black text-slate-900">Arranque rapido</p>
            <p className="text-sm text-slate-600">Comienzas a operar sin friccion inicial</p>
          </article>
          <article className="landing-kpi-card">
            <Layers3 className="size-5 text-sky-700" />
            <p className="text-2xl font-black text-slate-900">Mas control</p>
            <p className="text-sm text-slate-600">Procesos claros para cada rol</p>
          </article>
          <article className="landing-kpi-card">
            <Building2 className="size-5 text-sky-700" />
            <p className="text-2xl font-black text-slate-900">Escalable</p>
            <p className="text-sm text-slate-600">Crece por sucursales sin perder orden</p>
          </article>
          <article className="landing-kpi-card">
            <BarChart3 className="size-5 text-sky-700" />
            <p className="text-2xl font-black text-slate-900">Mas rentabilidad</p>
            <p className="text-sm text-slate-600">Mejor uso del tiempo y agenda del equipo</p>
          </article>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <article className="landing-panel p-5 sm:p-6">
            <p className="section-eyebrow">MVP disponible</p>
            <h3 className={`${headingFont.className} mt-2 text-2xl font-bold text-slate-900`}>Lo que ya puedes vender hoy</h3>
            <div className="mt-4 space-y-2">
              {mvpNow.map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </article>

          <article className="landing-panel p-5 sm:p-6">
            <p className="section-eyebrow">Proximamente</p>
            <h3 className={`${headingFont.className} mt-2 text-2xl font-bold text-slate-900`}>Lo que ofrecemos mas adelante</h3>
            <div className="mt-4 space-y-2">
              {roadmapNext.map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-sky-600" />
                  <span>{item}</span>
                </p>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="servicios" className="landing-section relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <SectionHeading
          eyebrow="Servicios"
          title="Modulos clave para operar tu centro clinico"
          description="Configura tu clinica con una base ordenada desde el primer dia y centraliza toda la gestion en un solo lugar."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              points={service.points}
            />
          ))}
        </div>
      </section>

      <section id="flujo" className="landing-section relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <SectionHeading
          eyebrow="Flujo clinico"
          title="Recorrido real de una atencion"
          description="El sistema esta modelado para el flujo operativo que ya implementaron: desde agendamiento hasta cierre clinico."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <article className="landing-flow-card">
            <span>1</span>
            <h3>Agendamiento</h3>
            <p>Paciente agenda por portal publico o recepcion crea cita interna.</p>
          </article>
          <article className="landing-flow-card">
            <span>2</span>
            <h3>Recepcion</h3>
            <p>Confirma llegada, cambia estado y asigna doctor segun disponibilidad.</p>
          </article>
          <article className="landing-flow-card">
            <span>3</span>
            <h3>Consulta</h3>
            <p>Doctor registra diagnostico, tratamiento, receta y notas medicas.</p>
          </article>
          <article className="landing-flow-card">
            <span>4</span>
            <h3>Seguimiento</h3>
            <p>Se actualiza historial clinico y se agenda siguiente control si aplica.</p>
          </article>
        </div>
      </section>

      <section id="impacto" className="landing-section relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <SectionHeading
          eyebrow="Impacto en el negocio"
          title="Impacto operativo para tu centro clinico"
          description="Mas control de agenda, menos errores de coordinacion y mejor continuidad del expediente medico."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {impactItems.map((item) => (
            <ImpactCard key={item.title} value={item.value} title={item.title} description={item.description} />
          ))}
        </div>
      </section>

      <section id="galeria" className="landing-section relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <SectionHeading
          eyebrow="Capturas reales"
          title="El sistema que ya construimos"
          description="7 vistas del sistema en produccion: dashboards por rol, calendario de citas, gestion de appointments, control de trabajadores, sucursales y panel del doctor."
        />

        <div className="mt-8">
          <SystemCarousel slides={systemSlides} />
        </div>
      </section>

      <section id="testimonios" className="landing-section relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <SectionHeading
          eyebrow="Testimonios"
          title="Lo que aprecia un equipo clinico"
          description="Beneficios percibidos al trabajar con una plataforma integrada en lugar de procesos manuales."
          align="center"
        />

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <TestimonialCard
              key={item.name}
              quote={item.quote}
              name={item.name}
              role={item.role}
              clinic={item.clinic}
            />
          ))}
        </div>
      </section>

      <section id="faq" className="landing-section relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 md:px-10">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="FAQ para decidir con confianza"
          description="Resolvimos las dudas mas comunes sobre el arranque y la implementacion en centros clinicos."
        />

        <div className="landing-panel mt-8 p-5 sm:p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`faq-${index}`}>
                <AccordionTrigger className="text-base font-semibold text-slate-900 hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slate-600">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section id="contacto" className="landing-section relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 md:px-10">
        <div className="landing-contact-wrap">
          <div>
            <p className="section-eyebrow">Contacto</p>
            <h2 className={`${headingFont.className} mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl`}>
              Agenda una demo de tu flujo completo en Clynic
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Te mostramos citas, pacientes, historial, consulta y panel doctor en un recorrido real
              de operacion. Listo para crecer por sucursal.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-700">
            <p className="landing-contact-item">
              <Phone className="size-4" />
              +503 69842090
            </p>
            <p className="landing-contact-item">
              <Mail className="size-4" />
              jeffreymardoqueo26260@gmail.com
            </p>
            <p className="landing-contact-item">
              <MapPin className="size-4" />
              El Salvador
            </p>
            <div className="pt-2">
              <Link href="/auth/login?onboarding=1" className="landing-cta-primary landing-cta-contact">
                Comenzar onboarding
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200/70 bg-white/70 px-6 py-7 backdrop-blur md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-3 text-sm text-slate-600 md:flex-row md:items-center">
          <p className="font-semibold text-slate-800">Clynic System</p>
          <p>Impulsa ingresos, mejora experiencia del paciente y ordena toda tu operacion clinica.</p>
          <p>2026 Clynic. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  )
}