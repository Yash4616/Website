import SkillsGrid from './skills/SkillsGrid';

const About = () => {
  return (
    <section id="about" className="py-24 bg-gradient-to-b from-gray-950 to-black">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">
            About Me
          </span>
        </h2>

        <div className="max-w-3xl mx-auto mb-16">
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            As a passionate AI and Machine Learning enthusiast, 
            I blend creative problem-solving with cutting-edge technology to build innovative solutions. 
            My journey in tech has been driven by curiosity and a desire to push the boundaries of what's possible.
          </p>
          <p className="text-gray-300 text-lg leading-relaxed">
            With expertise in both traditional web development and modern AI applications, 
            I specialize in creating intelligent, user-centric applications that leverage 
            the power of machine learning to deliver unique experiences. I'm particularly 
            excited about the intersection of AI and web technologies, where I focus on 
            developing scalable solutions that make AI accessible and practical.
          </p>
        </div>

        <SkillsGrid />
      </div>
    </section>
  );
};

export default About;