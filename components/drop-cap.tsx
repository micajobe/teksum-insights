interface DropCapProps {
  letter: string
}

export default function DropCap({ letter }: DropCapProps) {
  return (
    <span className="float-left mr-2 font-serif text-6xl font-bold leading-none mt-1 text-digital-blue">{letter}</span>
  )
} 