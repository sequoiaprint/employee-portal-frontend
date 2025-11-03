import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import MyProjects from '../../component/Projects/myProjects';
import AllProjects from '../../component/Projects/AllProjects/allProjects';
import AllTechProject from '../../component/Projects/AllTechProject/AllTechProject';

export default function ProjectsPage() {
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <header
        className="relative rounded-xl mb-8 p-6 text-white overflow-hidden transition-all duration-300 hover:shadow-lg"
        style={{
          backgroundImage: 'url("https://i.pinimg.com/736x/91/9b/6f/919b6fc5252c0a41ce99b1df46a6aee9.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "240px",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-gray-600/60 blur-sm rounded-xl"></div>
        <div className="relative z-10 p-6 h-full flex flex-col justify-center">
          <h1 className="font-extrabold text-3xl sm:text-4xl mb-2 drop-shadow-lg transition-all duration-300 hover:text-blue-300">
            Projects
          </h1>
          <p className="text-md sm:text-lg opacity-90 drop-shadow-md transition-all duration-300 hover:opacity-100">
            A complete view of individual and team projects
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium drop-shadow-md">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full transition-all duration-300 hover:scale-105 hover:bg-white/20">
              <span className="w-3 h-3 rounded-full bg-lime-500 inline-block animate-pulse"></span>
              <span>Internal projects info</span>
            </div>
          </div>
        </div>
      </header>



      {/* Projects Sections */}
      <div className="grid grid-cols-1 gap-8">
        <MyProjects />
        <AllProjects />
        <AllTechProject />
      </div>
    </div>
  );
}