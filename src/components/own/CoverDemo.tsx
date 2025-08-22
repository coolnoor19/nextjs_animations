import { Cover } from "@/components/ui/cover";

export default function CoverDemo(){
return(
     <div className="w-full px-4 border-amber-100 border-2  dark:bg-black/80 rounded-xl mt-10">
      <h1 className="text-4xl md:text-4xl lg:text-6xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
        Build AI gist PDF <br /> at <Cover>with AI Doc Nest</Cover>
      </h1>
    </div>
)
}