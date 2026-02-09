import React, { useEffect, useRef, useState } from "react"
import CarouselItem from "./CarouselItem"

import img1 from "../assets/images/1.png"
import img2 from "../assets/images/2.png"
import img3 from "../assets/images/3.png"
import img4 from "../assets/images/4.png"

export default function Carousel() {
  const carouselRef = useRef(null)
  const [active, setActive] = useState(1)

  useEffect(() => {
    const carousel = carouselRef.current
    const items = carousel.querySelectorAll(".item")
    const selects = carousel.querySelectorAll("select")
    const links = carousel.querySelectorAll(".sign-up-link")
    const countItem = items.length

    const changeSlider = () => {
      items.forEach(item => {
        item.classList.remove("active", "other_1", "other_2")
      })

      const other_1 = active - 1 < 0 ? countItem - 1 : active - 1
      const other_2 = active + 1 >= countItem ? 0 : active + 1

      items[active].classList.add("active")
      items[other_1].classList.add("other_1")
      items[other_2].classList.add("other_2")
    }

    selects.forEach(select => {
      select.onchange = e => {
        let target = 0
        if (e.target.value === "user") target = 0
        if (e.target.value === "admin") target = 1
        if (e.target.value === "organiser") target = 2
        carousel.classList.remove("next", "prev")
        carousel.classList.add(target > active ? "next" : "prev")
        setActive(target)
      }
    })

    links.forEach(link => {
      link.onclick = () => {
        const text = link.textContent.trim()
        let target = 0
        if (text === "Create Account") target = 3
        if (text === "Log in") target = 0
        carousel.classList.remove("next", "prev")
        carousel.classList.add(target > active ? "next" : "prev")
        setActive(target)
      }
    })

    changeSlider()
  }, [active])

  return (
    <section ref={carouselRef} className="carousel next">
      <div className="list">
        <CarouselItem
          image={img1}
          bgColor="#dc9174"
          title="Sign In"
          selectedRole="user"
          buttonText="Sign In"
        />

        <CarouselItem
          image={img2}
          bgColor="#f5bfaf"
          title="Sign In"
          selectedRole="admin"
          buttonText="Sign In"
        />

        <CarouselItem
          image={img3}
          bgColor="#dedfe1"
          title="Sign In"
          selectedRole="organiser"
          buttonText="Sign In"
        />

        <CarouselItem
          image={img4}
          bgColor="#c0f684"
          title="Create account"
          buttonText="Create account"
          isSignup
        />
      </div>
    </section>
  )
}
