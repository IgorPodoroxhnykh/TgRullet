import { getPrizes } from "./actions";
import { Prize } from "@/types/prize";
import HomeContent from "@/components/HomeContent";






export default async function Home() {
  const rawPrizes = await getPrizes()
  const prizes: Prize[] = rawPrizes.map((prize) => ({
    ...prize,
    createdAt: prize.createdAt.toISOString(),
    updatedAt: prize.updatedAt.toISOString(),
  }))


  return (

    //==================================================================================================

    <HomeContent prizes={prizes} />

    //==================================================================================================


  )
}