'use client';

import { useState } from 'react';
import { addCourse } from '@/actions/courseActions';

export default function AddCourseForm() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    department: '',
    akts: 0,
    quota: 50,
    semester: 'Fall',
    prerequisites: '',
    time: '',
    info: '',
    type: 'Mandatory'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'akts' || name === 'quota' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const courseData = {
      ...formData,
      // Split prerequisites by comma and trim
      prerequisites: formData.prerequisites ? formData.prerequisites.split(',').map(s => s.trim()) : [],
      // Ensure _id is set (using code)
      _id: formData.code
    };

    const result = await addCourse(courseData);
    
    if (result.success) {
      setMessage('Course added successfully!');
      setFormData({
        code: '',
        name: '',
        department: '',
        akts: 0,
        quota: 50,
        semester: 'Fall',
        prerequisites: '',
        time: '',
        info: '',
        type: 'Mandatory'
      });
    } else {
      setMessage(`Error: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8 text-gray-900">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Course</h2>
      {message && <p className={`mb-4 ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Course Code</label>
          <input required name="code" value={formData.code} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white" placeholder="e.g. CSE101" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Course Name</label>
          <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white" placeholder="e.g. Intro to CS" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Department</label>
          <input required name="department" value={formData.department} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white" />
        </div>

        <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Semester</label>
            <select name="semester" value={formData.semester} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white">
                <option value="Fall">Fall</option>
                <option value="Spring">Spring</option>
                <option value="Summer">Summer</option>
            </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">ECTS (AKTS)</label>
          <input type="number" required name="akts" value={formData.akts} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Quota</label>
          <input type="number" required name="quota" value={formData.quota} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1 text-gray-700">Prerequisites (comma separated codes)</label>
          <input name="prerequisites" value={formData.prerequisites} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-gray-900 bg-white" placeholder="e.g. CSE101, MTH101" />
        </div>

        <div className="md:col-span-2">
            <button disabled={loading} type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full disabled:bg-gray-400">
                {loading ? 'Adding...' : 'Add Course'}
            </button>
        </div>
      </form>
    </div>
  );
}

