// 'use client'
import TelegramAuth from "@/components/TelegramAuth";
import { getSession } from "@/utils/session";
import CarouselPrizes from "@/components/CarouselPrizes";
import { getPrizes } from "./actions";

// import { prizes } from "@/data/prizes";







export default async function Home() {
  const prizes = await getPrizes()
  // const session = await getSession()


  return (
    // <main className="flex min-h-screen flex-col items-center justify-center p-24">
    //   {/* <h1 className="text-4xl font-bold mb-8">Jwt Authentication for Telegram Mini Apps</h1>
    //   <pre>{JSON.stringify(session, null, 2)}</pre> */}
    //   {/* <TelegramAuth /> */}
    // </main>
    //==================================================================================================



    <div>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-8">
        <CarouselPrizes
          prizes={prizes}
        />
      </div>
    </div>





    //==================================================================================================
  )
}