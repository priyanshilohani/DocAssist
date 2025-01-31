'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <Link  className="logotext" href="/">DocAssist</Link>
          </div>
          <div className="menu">
            <Link href="/loggedin" className="button contrast">Sign In</Link>
            <Link href="/signup" className="signup-button contrast">Sign Up</Link>
          </div>
          <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Welcome to DocAssist</h1>
        <p>
          Simplify your note-taking and document management with our all-in-one platform. 
          Powered by AI, DocAssist enhances productivity, efficiency, and organization.
        </p>
        <div className="hero-buttons">
          <Link href="#features" className="button">
            Explore Features
          </Link>
        </div>
      </header>

      {/* About Us Section */}
      <section id="about-us" className="about-us">
        <h2>About DocAssist</h2>
        <p>
          Designed as part of a final year project, DocAssist integrates cutting-edge AI to 
          provide an intuitive and seamless user experience. From writing smarter to managing 
          notes, its the perfect tool for students and professionals alike.
        </p>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <h3>1. AI Text Editor</h3>
            <p>
              Write effortlessly with smart suggestions, formatting options, and document styling.
            </p>
          </div>
          <div className="step">
            <h3>2. DocBot Assistant</h3>
            <p>
              Organize your thoughts, find documents quickly, and get personalized assistance.
            </p>
          </div>
          <div className="step">
            <h3>3. Notes Drive</h3>
            <p>
              Securely store, organize, and retrieve your notes anytime, anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>Features</h2>
        <div className="feature">
          <div className="feature-image">
            <div className="image-placeholder">
              <Image 
              className='img-feature'
                src="/featueimg1.svg" 
                alt="AI Text Editor" 
                width={500} 
                height={300} 
              />
            </div>
          </div>
          <div className="feature-content">
            <h3>
              <Link href="/text-editor">AI-Powered Text Editor</Link>
            </h3>
            <p>
              Enhance your writing experience with advanced editing tools and AI-powered suggestions.
            </p>
          </div>
        </div>

        <div className="feature reverse">
          <div className="feature-content">
            <h3>
              <Link href="/docbot">DocBot Assistant</Link>
            </h3>
            <p>
              Find documents, organize thoughts, and let AI simplify your workflow.
            </p>
          </div>
          <div className="feature-image">
            <div className="image-placeholder">
              <Image className='img-feature'
                src="/docbot-feature-img.svg" 
                alt="DocBot Assistant" 
                width={500} 
                height={300} 
              />
            </div>
          </div>
        </div>

        <div className="feature">
          <div className="feature-image">
            <div className="image-placeholder">
              <Image  className='img-feature'
                src="/storage-img.svg" 
                alt="Notes Drive" 
                width={500} 
                height={300} 
              />
            </div>
          </div>
          <div className="feature-content">
            <h3>
              <Link href="/storage">Notes Drive</Link>
            </h3>
            <p>
              Safely store and access your notes anywhere, anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <h2>What Users Say</h2>
        <div className="testimonial">
          <p>&quot;DocAssist streamlined my workflow and helped me stay organized like never before</p>
          <span>-Researcher</span>
        </div>
        <div className="testimonial">
          <p>&quot;A simple yet powerful platform that brings together AI and user-friendly tools.&quot;</p>
          <span>- Academic Reviewer</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} DocAssist. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
