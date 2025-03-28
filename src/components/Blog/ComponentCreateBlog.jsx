import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from "../../api.js";
import Footer from "../Footer/Footer.jsx";

const CreateBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuration constants
  const TITLE_MAX_WORDS = 20;
  const DESCRIPTION_MAX_WORDS = 100;
  const CONTENT_MAX_WORDS = 5000;

  // Memoized word count function
  const countWords = useCallback((text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, []);

  // Memoized validation for each input
  const validateInput = useCallback((text, maxWords) => {
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    return wordCount > 0 && wordCount <= maxWords;
  }, []);

  // Input change handlers with real-time validation
  const handleInputChange = useCallback((setter, maxWords) => (e) => {
    const inputText = e.target.value;
    const words = inputText.trim().split(/\s+/);
    
    if (words.length <= maxWords) {
      setter(inputText);
    }
  }, []);

  // Submission handler with improved error handling and loading state
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    const titleValid = validateInput(title, TITLE_MAX_WORDS);
    const descriptionValid = validateInput(description, DESCRIPTION_MAX_WORDS);
    const contentValid = validateInput(content, CONTENT_MAX_WORDS);

    if (titleValid && descriptionValid && contentValid) {
      setIsSubmitting(true);
      try {
        const submitObject = {
          title: title.trim(),
          description: description.trim(),
          content: content.trim(),
          dateCreated: new Date()
        };

        await createPost(submitObject);
        navigate('/Blog');
      } catch (error) {
        console.error("Blog post creation failed:", error);
        alert("Failed to create blog post. Please check your connection and try again.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Detailed error messaging
      const errors = [];
      if (!titleValid) errors.push(`Title must be 1-${TITLE_MAX_WORDS} words`);
      if (!descriptionValid) errors.push(`Description must be 1-${DESCRIPTION_MAX_WORDS} words`);
      if (!contentValid) errors.push(`Content must be 1-${CONTENT_MAX_WORDS} words`);
      
      alert("Please correct the following:\n" + errors.join("\n"));
    }
  };

  // Remaining words calculation with countWords dependency
  const remainingTitleWords = useMemo(() => 
    TITLE_MAX_WORDS - countWords(title), [title, TITLE_MAX_WORDS, countWords]);
  const remainingDescriptionWords = useMemo(() => 
    DESCRIPTION_MAX_WORDS - countWords(description), [description, DESCRIPTION_MAX_WORDS, countWords]);
  const remainingContentWords = useMemo(() => 
    CONTENT_MAX_WORDS - countWords(content), [content, CONTENT_MAX_WORDS, countWords]);

  return (
    <>
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg mt-23 mb-20">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 ">Create Your Blog Post</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Blog Post Title <span className="text-sm text-gray-500">(Max {TITLE_MAX_WORDS} words)</span>
          </label>
          <input 
            value={title}
            onChange={handleInputChange(setTitle, TITLE_MAX_WORDS)} 
            name="title" 
            className={`w-full p-3 border rounded-md focus:outline-none 
              ${remainingTitleWords < 3 ? 'border-yellow-500' : 'border-gray-300'}
              ${remainingTitleWords < 0 ? 'border-red-500' : ''}`}
            placeholder="Enter an engaging blog post title"
            maxLength={200} // Rough character limit
          />
          <p className={`text-sm mt-1 ${remainingTitleWords < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {remainingTitleWords >= 0 
              ? `${remainingTitleWords} words remaining` 
              : 'Exceeded maximum word limit'}
          </p>
        </div>

        {/* Description Input */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Brief Description <span className="text-sm text-gray-500">(Max {DESCRIPTION_MAX_WORDS} words)</span>
          </label>
          <input 
            value={description}
            onChange={handleInputChange(setDescription, DESCRIPTION_MAX_WORDS)} 
            name="description" 
            className={`w-full p-3 border rounded-md focus:outline-none 
              ${remainingDescriptionWords < 10 ? 'border-yellow-500' : 'border-gray-300'}
              ${remainingDescriptionWords < 0 ? 'border-red-500' : ''}`}
            placeholder="Summarize your blog post in a few words"
            maxLength={500} // Rough character limit
          />
          <p className={`text-sm mt-1 ${remainingDescriptionWords < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {remainingDescriptionWords >= 0 
              ? `${remainingDescriptionWords} words remaining` 
              : 'Exceeded maximum word limit'}
          </p>
        </div>

        {/* Content Input */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Blog Post Content <span className="text-sm text-gray-500">(Max {CONTENT_MAX_WORDS} words)</span>
          </label>
          <textarea 
            value={content}
            onChange={handleInputChange(setContent, CONTENT_MAX_WORDS)} 
            name="content" 
            className={`w-full p-3 border rounded-md h-48 focus:outline-none 
              ${remainingContentWords < 500 ? 'border-yellow-500' : 'border-gray-300'}
              ${remainingContentWords < 0 ? 'border-red-500' : ''}`}
            placeholder="Write your full blog post here..."
            maxLength={30000} // Rough character limit
          />
          <p className={`text-sm mt-1 ${remainingContentWords < 0 ? 'text-red-500' : 'text-gray-500'}`}>
            {remainingContentWords >= 0 
              ? `${remainingContentWords} words remaining` 
              : 'Exceeded maximum word limit'}
          </p>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full p-3 rounded-md text-white font-semibold transition-colors duration-300
            ${isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'}`}
        >
          {isSubmitting ? 'Submitting...' : 'Publish Blog Post'}
        </button>
      </form>
    </div>

<Footer/>
</>
  );
}

export default CreateBlog;