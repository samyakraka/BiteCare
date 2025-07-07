import Link from "next/link"
import Image from "next/image"

export default function CategoryCards() {
  const categories = [
    {
      id: "appetizers",
      name: "Appetizers",
      image: "https://allshecooks.com/wp-content/uploads/2013/10/mozzarella-sticks.jpg",
      count: 12,
    },
    {
      id: "main-courses",
      name: "Main Courses",
      image: "https://imhungryforthat.com/wp-content/uploads/2022/04/olive-garden-chicken-parmesan-recipe.jpg.webp",
      count: 18,
    },
    {
      id: "pizzas",
      name: "Pizzas",
      image: "https://cdn.pixabay.com/photo/2017/08/02/12/38/pepperoni-2571392_1280.jpg",
      count: 10,
    },
    {
      id: "desserts",
      name: "Desserts",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Tiramisu_-_Raffaele_Diomede.jpg/500px-Tiramisu_-_Raffaele_Diomede.jpg",
      count: 8,
    },
  ]

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold mb-8">Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/menu?category=${category.id}`}
            className="group relative overflow-hidden rounded-lg"
          >
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors z-10" />
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              width={200}
              height={200}
              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white">
              <h3 className="text-xl font-bold mb-1">{category.name}</h3>
              <p className="text-sm opacity-90">{category.count} items</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
