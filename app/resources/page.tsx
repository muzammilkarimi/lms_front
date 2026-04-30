"use client";

import { useMemo, useState } from "react";

type Resource = {
  domain: string;
  subdomain: string;
  title: string;
  description: string;
  url: string;
};

const resourceData = {
  "AI": ["Basics Maths", "Machine Learning", "Deep Learning", "LLMs", "Artificial Intelligence", "NLP", "Computer Vision", "Practice Platform"],
  "Programming": ["C++", "Python"]
};

const resources: Resource[] = [
  {
    domain: "Programming",
    subdomain: "C++",
    title: "Pointers in C / C++ [Full Course]",
    description: "Pointers in C / C++ [Full Course] by freecodecamp",
    url: "https://www.youtube.com/watch?v=zuegQmMdy8M"
  },
  {
    domain: "Programming",
    subdomain: "C++",
    title: "C++ by The Cherno",
    description: "C++ by The Cherno is a beginner-to-advanced YouTube tutorial series by Yan Chernikov that explains core C++ concepts—from compiler/linker internals and memory management to modern C++ features like smart pointers, templates, threading, and custom data structures .",
    url: "https://youtube.com/playlist?list=PLlrATfBNZ98dudnM48yfGUldqGD0S4FFb&si=pAFUIOwry1Xka-BD"
  },
  {
    domain: "Programming",
    subdomain: "Python",
    title: "Chai aur Python by Chai aur Code(Hindi)",
    description: "A python series for beginners. If you are interested to learn python to get ready for industry and know behind the scene working of python, you are at right place. This is practical python where we write code, not the series that focus to get marks in exam. We do things like it's done in industry so that you can build real applications, not toy code.",
    url: "https://youtube.com/playlist?list=PLu71SKxNbfoBsMugTFALhdLlZ5VOqCg2s&si=-2YE6_AW2GWYZ_PS"
  },
  {
    domain: "Programming",
    subdomain: "Python",
    title: "Python Tutorials by Corey Schafer",
    description: "Python Tutorials. An in-depth look at the Python programming language. Learn about Python development, tips and tricks, walkthroughs, and best practices.",
    url: "https://www.youtube.com/playlist?list=PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU"
  },
  {
    domain: "AI",
    subdomain: "Practice Platform",
    title: "Google NotebookLM",
    description: "Use the power of AI for quick summarization and note taking, NotebookLM is your powerful virtual research assistant rooted in information you can trust.",
    url: "https://notebooklm.google.com/"
  },
  {
    domain: "AI",
    subdomain: "Practice Platform",
    title: "PyTorch.io",
    description: "LearnPyTorch.io is a dedicated resource offering clear, beginner-friendly tutorials and projects to help learners master PyTorch for deep learning. It’s perfect for anyone wanting practical, hands-on experience building neural networks and AI models.",
    url: "https://www.learnpytorch.io/"
  },
  {
    domain: "AI",
    subdomain: "Practice Platform",
    title: "Google Colab",
    description: "Google Colab is a free, cloud-based Jupyter notebook environment that lets you write and execute Python code right in your browser, with no setup required. It’s widely used for machine learning, data analysis, and collaborative projects thanks to its free GPU and TPU support.",
    url: "https://colab.research.google.com/"
  },
  {
    domain: "AI",
    subdomain: "Practice Platform",
    title: "Kaggle ",
    description: "Kaggle is a popular platform for data science and machine learning where users can access datasets, participate in competitions, and share code notebooks. It’s a vibrant community hub for learning, experimenting, and showcasing data-driven projects.",
    url: "https://www.kaggle.com/"
  },
  {
    domain: "AI",
    subdomain: "Practice Platform",
    title: "Hugging Face ",
    description: "Hugging Face is a leading AI platform offering powerful tools, models, and datasets for natural language processing, computer vision, and machine learning workflows. It’s widely known for Transformers, enabling developers and researchers to easily build, fine-tune, and deploy state-of-the-art AI models.",
    url: "https://huggingface.co/"
  },
  {
    domain: "AI",
    subdomain: "Practice Platform",
    title: "Tensorflow Playground",
    description: "A tiny neural network library that meets the demands of this educational visualization. For real-world applications, consider the TensorFlow library.",
    url: "https://playground.tensorflow.org/"
  },
  {
    domain: "AI",
    subdomain: "Computer Vision",
    title: "Computer vision from scratch by Vizuara",
    description: "Computer Vision from Scratch by Vizuara is a free, in-depth YouTube course taught by Naman Dwivedi (MIT PhD) that starts with traditional image processing and builds up to modern CV techniques like CNNs, Vision Transformers, object detection, and segmentation .",
    url: "https://youtube.com/playlist?list=PLPTV0NXA_ZSgmWYoSpY_2EJzPJjkke4Az&si=HCMTfTabXWA1EBOY"
  },
  {
    domain: "AI",
    subdomain: "NLP",
    title: "Natural Language Processing by Krish Naik Hindi",
    description: "Natural Language Processing by Krish Naik (Hindi) is a comprehensive course that explains key NLP concepts—like tokenization, word embeddings, sequence models, and text classification—in clear Hindi. It combines theoretical basics with practical Python examples, making it ideal for Hindi-speaking learners wanting hands-on NLP experience.",
    url: "https://youtube.com/playlist?list=PLTDARY42LDV67aWThoZxflLYGnD3Rh3VG&si=c8ULZ1ds6Uc9PbU-"
  },
  {
    domain: "AI",
    subdomain: "NLP",
    title: "Stanford CS224N: Natural Language Processing with Deep Learning",
    description: "Natural language processing (NLP) is a crucial part of artificial intelligence (AI), modeling how people share information. In recent years, deep learning approaches have obtained very high performance on many NLP tasks. In this course, students gain a thorough introduction to cutting-edge neural networks for NLP.",
    url: "https://youtube.com/playlist?list=PLoROMvodv4rMFqRtEuo6SGjY4XbRIVRd4&si=pjarYLerw984KBAf"
  },
  {
    domain: "AI",
    subdomain: "LLMs",
    title: "Hugging Face Course by HuggingFace",
    description: "All videos from the Hugging Face Course: hf.co/course",
    url: "https://youtube.com/playlist?list=PLo2EIpI_JMQvWfQndUesu0nPBAtZ9gP1o&si=66ddu6jVAnbON_QE"
  },
  {
    domain: "AI",
    subdomain: "LLMs",
    title: "Large Language Models IITD",
    description: "LLM Full Course: Master Large Language Models offers an in-depth look at modern LLMs, covering architectures, NLP techniques, ethics, and real-world applications. Taught by experts from IIT Delhi, Microsoft, and IBM Research, it’s ideal for learners with ML and Python backgrounds eager to explore cutting-edge AI.",
    url: "https://youtube.com/playlist?list=PLqGkIjcOyrGnjyBHl4GE2S9kX47X96FH-&si=vCrcSDPXROJITc9g"
  },
  {
    domain: "AI",
    subdomain: "LLMs",
    title: "Build a Large Language Model (From Scratch) by Sebastian Raschka",
    description: "Supplementary code along videos for the Build a Large Langauge Model (From Scratch) by Sebastian Raschka.",
    url: "https://youtube.com/playlist?list=PLTKMiZHVd_2IIEsoJrWACkIxLRdfMlw11&si=m6qH1fHbXgDXhDln"
  },
  {
    domain: "AI",
    subdomain: "LLMs",
    title: "Building LLMs from scratch by Vizuara",
    description: "In this playlist, we will learn about the entire process of building a Large Language Model (LLM) from scratch. Nothing will be assumed. Everything will be spelled out.",
    url: "https://youtube.com/playlist?list=PLPTV0NXA_ZSgsLAr8YCgCwhPIJNNtexWu&si=0K03HMXRsKZ3nWzc"
  },
  {
    domain: "AI",
    subdomain: "Artificial Intelligence",
    title: "An Introduction to Artificial Intelligence by NPTEL IIT Delhi",
    description: "An Introduction to Artificial Intelligence (NPTEL, IIT Delhi) is a beginner-friendly course by Prof. Mausam covering AI fundamentals like search, logic, probabilistic reasoning, and learning methods. It’s perfect for students seeking a solid base to explore advanced AI topics and applications.",
    url: "https://youtube.com/playlist?list=PLp6ek2hDcoNB_YJCruBFjhF79f5ZHyBuz&si=joJlRvRgZXOQHr3k"
  },
  {
    domain: "AI",
    subdomain: "Deep Learning",
    title: "Neural Networks: Zero to Hero by Andrej Karpathy",
    description: "Neural Networks: Zero to Hero by Andrej Karpathy is a hands‑on YouTube series that guides you from building a simple backprop engine to constructing full-scale transformers and language models entirely from scratch .",
    url: "https://youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ&si=k746Y2rNNcvGUITs"
  },
  {
    domain: "AI",
    subdomain: "Deep Learning",
    title: "Neural networks 3Blue1Brown",
    description: "Learn the basics of neural networks and backpropagation, one of the most important algorithms for the modern world.",
    url: "https://youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi&si=6uLpGHZ4CsWWH0LM"
  },
  {
    domain: "AI",
    subdomain: "Deep Learning",
    title: "100 Days of Deep Learning",
    description: "A complete end-to-end playlist on Deep Learning where topics like ANN, CNN, and RNN are covered.",
    url: "https://youtube.com/playlist?list=PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn&si=zZG8YthH-B6yfzhK"
  },
  {
    domain: "AI",
    subdomain: "Deep Learning",
    title: "Deep Learning NPTEL-NOC IITM",
    description: "NPTEL‑NOC Deep Learning (IIT Madras, 2019) is a rigorous 12‑week course taught by Prof. Mitesh M. Khapra and Prof. Sudarshan Iyengar, covering fundamentals to advanced deep learning topics.",
    url: "https://youtube.com/playlist?list=PLyqSpQzTE6M9gCgajvQbc68Hk_JKGBAYT&si=PncoKvBKtAqah02f"
  },
  {
    domain: "AI",
    subdomain: "Machine Learning",
    title: "Numpy + Pandas + Matplotlib + Seaborn - CampusX",
    description: "CampusX’s NumPy, Pandas, Matplotlib, and Seaborn series teaches essential Python libraries for data analysis and visualization, from data manipulation to creating insightful plots.",
    url: "https://youtube.com/playlist?list=PLEkC1_DzbPc6cFLC1uoDco7bszPKy4DnP&si=7C10_fyQnRGKHANT"
  },
  {
    domain: "AI",
    subdomain: "Machine Learning",
    title: "100 Days of Machine Learning",
    description: "100 Days of Machine Learning is a self-paced challenge designed to help learners build consistent ML skills through daily practice.",
    url: "https://youtube.com/playlist?list=PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH&si=9Ep0_QiG0deamUbC"
  },
  {
    domain: "AI",
    subdomain: "Machine Learning",
    title: "Stanford CS229: Machine Learning Course I Summer 2019 (Anand Avati)",
    description: "Stanford CS229: Machine Learning (Summer 2019, Anand Avati) is a renowned course covering core machine learning concepts, algorithms, and mathematical foundations.",
    url: "https://youtube.com/playlist?list=PLoROMvodv4rNH7qL6-efu_q2_bPuy0adh&si=WEXnrPobzWMv7Vpi"
  },
  {
    domain: "AI",
    subdomain: "Basics Maths",
    title: "Essence of linear algebra by 3blue1brown",
    description: "A free course offering the core concept of linear algebra with a visuals-first approach.",
    url: "https://youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab&si=FzTNbYncgh5jDfiY"
  },
  {
    domain: "AI",
    subdomain: "Basics Maths",
    title: "Essence of Calculus by 3blue1brown",
    description: "A free course offering the core concept of Calculus, with a visuals-first approach aimed at making you feel like you could have discovered the subject yourself.",
    url: "https://youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr&si=hUWqjQu8PP5MsXta"
  },
  {
    domain: "AI",
    subdomain: "Basics Maths",
    title: "Math for Machine Learning: Probability,Calculus & Linear Algebra Essential for Data Science, Al & ML.",
    description: "This course teaches the essential math—like linear algebra, calculus, and probability—needed to understand and build machine learning and AI systems.",
    url: "https://youtube.com/playlist?list=PLlpUUtQ9RrF76jvALwrTp0oOGfk0EGC3s&si=52MVCLfRzFda3wWe"
  }
];

export default function ResourcesPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(8);

  const filteredResources = useMemo(() => {
    return resources.filter(res => 
      (selectedDomain === "all" || res.domain === selectedDomain) && 
      (selectedSubdomain === "all" || res.subdomain === selectedSubdomain)
    );
  }, [selectedDomain, selectedSubdomain]);

  const displayedResources = filteredResources.slice(0, visibleCount);

  return (
    <main className="resourcesPage">
      <section className="resourcesMiniHero">
        <div className="resourcesIntroContent">
          <div>
            <p className="eyebrow">Resource Library</p>
            <h1>Master your skills with curated study materials.</h1>
            <p>A hand-picked collection of top-tier resources to help you master AI and Programming at your own pace.</p>
          </div>
          <img
            src="https://img.icons8.com/ios-filled/188/ffffff/briefcase.png"
            alt="Resources icon"
            className="resourcesMascot"
          />
        </div>
      </section>

      <section className="resourcesContent">
        <div className="resourcesToolbar">
          <label className="resourceFilterField">
            <span>Domain</span>
            <select 
              value={selectedDomain} 
              onChange={(e) => {
                setSelectedDomain(e.target.value);
                setSelectedSubdomain("all");
                setVisibleCount(8);
              }}
            >
              <option value="all">All Domains</option>
              {Object.keys(resourceData).map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </label>

          <label className="resourceFilterField">
            <span>Topic</span>
            <select 
              value={selectedSubdomain} 
              onChange={(e) => {
                setSelectedSubdomain(e.target.value);
                setVisibleCount(8);
              }}
            >
              <option value="all">All Topics</option>
              {selectedDomain !== "all" && resourceData[selectedDomain as keyof typeof resourceData].map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="resourcesGrid">
          {displayedResources.length > 0 ? (
            displayedResources.map((res, idx) => (
              <article key={idx} className="resourceCard">
                <div className="resourceMeta">
                  <span className="domainTag">{res.domain}</span>
                  <span className="subdomainTag">{res.subdomain}</span>
                </div>
                <h3>{res.title}</h3>
                <p>{res.description}</p>
                <a href={res.url} target="_blank" rel="noopener noreferrer" className="resourceLink">
                  Open Resource
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </article>
            ))
          ) : (
            <div className="emptyState">
              <p>No resources found for this topic yet. Check back soon!</p>
            </div>
          )}
        </div>

        {visibleCount < filteredResources.length && (
          <div className="loadMoreContainer">
            <button 
              className="secondaryButton" 
              onClick={() => setVisibleCount(prev => prev + 8)}
            >
              Load more resources
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
