import { useNavigate } from "react-router-dom";
import "./Home.css";

/* LOCAL IMAGES */
import tshirtImg from "../assets/dress1.jpg";
import joggerImg from "../assets/dress2.jpg";
import formalShirtImg from "../assets/dress3.webp";
import formalPantImg from "../assets/dress4.webp";

export default function Home() {
  const navigate = useNavigate();

  const marqueeImages = [tshirtImg, joggerImg, formalShirtImg, formalPantImg];

  return (
    <div className="home">

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <h1>Men’s Fashion Collection 👔</h1>
          <p>Premium T-Shirts, Shirts, Joggers & Formal Pants for Men.</p>
          <button onClick={() => navigate("/products")}>
            Shop Now
          </button>
        </div>

        {/* MARQUEE IMAGES */}
        <div className="hero-marquee">
          <div className="marquee-track">
            {marqueeImages.map((img, index) => (
              <img key={index} src={img} alt={`Men Outfit ${index}`} />
            ))}
            {/* Repeat for continuous scroll */}
            {marqueeImages.map((img, index) => (
              <img key={index + marqueeImages.length} src={img} alt={`Men Outfit ${index}`} />
            ))}
          </div>
        </div>
      </section>

      {/* MEN CLOTHING */}
      <section className="featured">
        <h2>🔥 Men’s Clothing</h2>

        <div className="dress-grid">

          <div className="dress-card">
            <img src={tshirtImg} alt="Men T-Shirt" />
            <h4>Men’s T-Shirt</h4>
            <p>₹ 799</p>
          </div>

          <div className="dress-card">
            <img src={joggerImg} alt="Shirts" />
            <h4>Shirts</h4>
            <p>₹ 1050</p>
          </div>

          <div className="dress-card">
            <img src={formalShirtImg} alt="Formal Pant" />
            <h4>Formal Pant</h4>
            <p>₹1099</p>
          </div>

          <div className="dress-card">
            <img src={formalPantImg} alt="Formal Pants" />
            <h4>Jogger Pants</h4>
            <p>₹500</p>
          </div>

        </div>
      </section>
    </div>
  );
}
