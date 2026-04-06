'use client'

import { useState } from "react";

const AddPostModal = ({ handleCloseEvent }: { handleCloseEvent: () => void }) => {
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('');
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);

    //Handle form submission
    const handleformSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();

        const postData = {
            title: title,
            status: status,
            featured_Image: featuredImage
        }
        
        console.log(postData);
    }
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
                <h2 className="text-2xl mb-4">Add New Alumni</h2>
                <form onSubmit={handleformSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input 
                                type="text" 
                                className="border border-gray-300 rounded w-full p-2"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select 
                                className="border border-gray-300 rounded w-full p-2"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                required
                            >
                                <option value="" hidden>Select Status</option>
                                <option value="publish">Publish</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Featured Image</label>
                            <input type="file" onChange={(e) => setFeaturedImage(e.target.files ? e.target.files[0] : null)}  />
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button 
                            type="button"
                            className="bg-gray-500 text-white px-4 py-2 rounded mr-2 cursor-pointer"
                            onClick={handleCloseEvent}
                        >
                            Cancel
                        </button>

                        <button 
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddPostModal;