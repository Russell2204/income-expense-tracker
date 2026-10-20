import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Languages, LineChart, Moon, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Wallet,
    title: "Операции",
    text: "Доход и расход добавляются, меняются и удаляются. Список фильтруется по выбранному месяцу."
  },
  {
    icon: LineChart,
    title: "Графики",
    text: "Итог месяца, столбцы по дням и доля дохода с расходом собраны в отдельных вкладках."
  },
  {
    icon: Moon,
    title: "Тема и валюта",
    text: "Светлый и тёмный вид, валюта по умолчанию «сум». Настройка сохраняется в аккаунте."
  },
  {
    icon: Languages,
    title: "Два языка",
    text: "Интерфейс переключается между русским и узбекским без перезагрузки страницы."
  }
];

const steps = [
  ["Аккаунт", "Регистрация и вход. У каждого человека свои операции и настройки."],
  ["Месяц", "Стрелки листают месяц. Графики и список показывают только его."],
  ["Запись", "Название, сумма, дата и тип. После сохранения запись сразу попадает в базу."]
];

function shift(value, distance, reduced) {
  return reduced ? 0 : value * distance;
}

export default function App() {
  const reduced = useReducedMotion();
  const pageRef = useRef(null);
  const storyRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"]
  });
  const { scrollYProgress: storyProgress } = useScroll({
    target: storyRef,
    offset: ["start end", "end start"]
  });

  const slow = useTransform(scrollYProgress, (value) => shift(value, -180, reduced));
  const mid = useTransform(scrollYProgress, (value) => shift(value, -90, reduced));
  const fast = useTransform(scrollYProgress, (value) => shift(value, -280, reduced));
  const cardY = useTransform(storyProgress, (value) => shift(value - 0.5, 140, reduced));
  const chartY = useTransform(storyProgress, (value) => shift(value - 0.5, -90, reduced));
  const noteY = useTransform(storyProgress, (value) => shift(value - 0.5, 70, reduced));

  return (
    <div ref={pageRef} className="relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div style={{ y: slow }} className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-[#b7e4cf] blur-3xl" />
        <motion.div style={{ y: fast }} className="absolute right-[-4rem] top-24 h-72 w-72 rounded-full bg-[#f3c2ae] blur-3xl" />
        <motion.div style={{ y: mid }} className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-[#efe3b8] blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/50 bg-[#f3efe6]/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-3">
          <a href="#top" className="font-serif text-lg">Трекер</a>
          <nav className="hidden gap-6 text-sm text-[#6d655c] sm:flex">
            <a href="#story">Обзор</a>
            <a href="#features">Возможности</a>
            <a href="#steps">Как устроен</a>
          </nav>
          <Button asChild>
            <a href="/app/">Открыть трекер</a>
          </Button>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto grid min-h-[88vh] w-full max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge variant="outline">Презентация проекта</Badge>
            <motion.h1
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mt-5 max-w-xl font-serif text-5xl leading-[1.05] sm:text-6xl"
            >
              Доходы и расходы в одном спокойном окне
            </motion.h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-[#6d655c]">
              Личный трекер считает месяц, рисует графики и хранит записи в аккаунте. Эта страница показывает, из чего он состоит.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href="/app/">
                  Перейти в приложение
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#features">Смотреть возможности</a>
              </Button>
            </div>
          </div>

          <motion.div style={{ y: cardY }} className="relative">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6d655c]">Октябрь 2026</p>
                <Badge variant="income">Баланс +9 000 сум</Badge>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  ["Доход", "10 000"],
                  ["Расход", "1 000"],
                  ["Баланс", "9 000"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-white/50 p-3">
                    <p className="text-xs text-[#6d655c]">{label}</p>
                    <p className="mt-1 font-serif text-xl">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex h-36 items-end gap-2">
                {[40, 70, 35, 88, 52, 64, 46].map((height, index) => (
                  <div key={index} className="flex-1 rounded-t-lg bg-[#243f38]" style={{ height: `${height}%`, opacity: 0.35 + index * 0.08 }} />
                ))}
              </div>
            </Card>
            <motion.div style={{ y: chartY }} className="absolute -left-6 top-16 hidden w-40 sm:block">
              <Card className="p-4">
                <Badge variant="expense">Расход</Badge>
                <p className="mt-3 font-serif text-2xl">1 000</p>
                <p className="text-sm text-[#6d655c]">Кафе · 15.10</p>
              </Card>
            </motion.div>
            <motion.div style={{ y: noteY }} className="absolute -right-4 bottom-8 hidden w-44 sm:block">
              <Card className="p-4">
                <Badge variant="income">Доход</Badge>
                <p className="mt-3 font-serif text-2xl">10 000</p>
                <p className="text-sm text-[#6d655c]">Зарплата · 15.10</p>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        <section id="story" ref={storyRef} className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-[#6d655c]">Обзор</p>
              <h2 className="mt-3 font-serif text-4xl">Месяц читается с первого экрана</h2>
              <p className="mt-4 max-w-md leading-7 text-[#6d655c]">
                Сначала итог, потом дни, потом доля дохода и расхода. Форма, список и настройки открываются отдельными вкладками, без длинной простыни на одной странице.
              </p>
            </div>
            <div className="grid gap-4">
              {["Итоги месяца", "Столбцы по дням", "Доля дохода и расхода"].map((title, index) => (
                <motion.div
                  key={title}
                  style={{ y: useLayer(storyProgress, index, reduced) }}
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{title}</CardTitle>
                      <CardDescription>Вкладка {index + 1} из основного экрана трекера.</CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-serif text-4xl">Что умеет трекер</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={reduced ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: reduced ? 0 : index * 0.06 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <feature.icon className="size-5 text-[#1f7a4d]" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.text}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="steps" className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-serif text-4xl">Как этим пользоваться</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map(([title, text], index) => (
              <li key={title}>
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <p className="font-serif text-3xl text-[#1f7a4d]">0{index + 1}</p>
                    <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6d655c]">{text}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-24">
          <Card className="overflow-hidden">
            <CardContent className="flex flex-col items-start gap-6 px-8 py-12 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-4xl">Открыть трекер</h2>
                <p className="mt-3 max-w-md text-[#6d655c]">Регистрация, графики и список операций живут в приложении. Эта страница только представляет его.</p>
              </div>
              <Button asChild size="lg">
                <a href="/app/">
                  Войти или создать аккаунт
                  <ArrowRight className="size-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function useLayer(progress, index, reduced) {
  const distance = 40 + index * 36;
  return useTransform(progress, (value) => shift(value - 0.5, distance, reduced));
}
