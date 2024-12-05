import "./AboutUs.css";

const AboutUs = () => {
  return (
    <section className="about-us">
      <div className="about-us-container">
        <h2 className="about-us-title">About Us</h2>
        <p className="about-us-intro">
          Welcome to <span className="highlight">Dogopedia</span>, your ultimate hub for everything dog-related. We are a passionate group of students working together to create a comprehensive platform for dog lovers and enthusiasts.
        </p>

        <div className="about-us-mission">
          <h3>Our Mission</h3>
          <p>
            At Dogopedia, our goal is to provide accurate, engaging, and easy-to-access information about dog breeds, their traits, care tips, and more. Whether you're a first-time dog owner or a seasoned trainer, our platform is designed to help you connect with the dog world.
          </p>
        </div>

        <div className="about-us-team">
          <h3>Who Are We?</h3>
          <p>
            We are a group of university students from diverse academic backgrounds who share a common love for dogs and technology. Through this project, we aim to combine our skills in software development, design, and research to build something meaningful for the community.
          </p>
        </div>

        <div className="about-us-values">
          <h3>Why Dogopedia?</h3>
          <ul>
            <li>🌟 Easy-to-navigate platform with detailed information on dog breeds.</li>
            <li>🌟 Helpful resources for prospective and current dog owners.</li>
            <li>🌟 Created with love, passion, and a strong commitment to quality.</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
