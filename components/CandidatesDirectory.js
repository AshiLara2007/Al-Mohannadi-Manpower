'use client';

import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export default function CandidatesDirectory() {
  const { candidates, translations, searchQuery, setSearchQuery, selectedFilter, setSelectedFilter } = useContext(AppContext);

  const filters = ['All', 'Driver', 'Nurse', 'Cook', 'Teacher', 'House Maid'];

  return (
    <div className="py-32 px-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{translations.candidates}</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Browse through our verified candidates database</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <input type="text" placeholder={translations.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 min-w-[200px] form-input" />
        <div className="flex flex-wrap gap-2">
          {filters.map(f => (
            <button key={f} onClick={() => setSelectedFilter(f)} className={`filter-btn ${selectedFilter === f ? 'active' : ''}`}>
              {f === 'All' ? translations.filterAll : f}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-gray-500 mb-4">📊 {candidates.length} candidates found</div>

      <div className="flex flex-wrap gap-5">
        {candidates.map(candidate => (
          <div key={candidate.id} className="candidate-card">
            <span className={`status-badge ${candidate.status.toLowerCase()}`}>{candidate.status}</span>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl mb-4">
              <i className="fa-regular fa-user"></i>
            </div>
            <div className="font-bold text-gray-900 dark:text-white">{candidate.name}</div>
            <div className="text-xs text-primary font-semibold my-2">{candidate.role}</div>
            <div className="w-full h-px bg-gray-200 dark:bg-gray-700 my-2"></div>
            <div className="flex justify-between w-full text-xs">
              <span><i className="fa-solid fa-location-dot"></i> {candidate.country}</span>
              <span className="font-bold">{candidate.salary}</span>
            </div>
          </div>
        ))}
      </div>

      {candidates.length === 0 && (
        <div className="text-center py-10 text-gray-500">{translations.noResults}</div>
      )}
    </div>
  );
}