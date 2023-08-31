import {createContext, useState, useEffect } from 'react';
import Post from "../Post";
import { format } from 'date-fns';
import api from "../api/Posts";
import EditPost from "../EditPost";  
import useWindowSize from "../hooks/useWindowSize";
import useAxiosFetch from "../hooks/useAxiosFetch";
import { useNavigate } from 'react-router-dom';

const DataContext = createContext({})

export const DataProvider = ({children}) => {

    const [posts, setPosts] = useState([])
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [postTitle, setPostTitle] = useState('')
    const [postBody, setPostBody] = useState('')
    const [editTitle, setEditTitle] = useState('')
    const [editBody, setEditBody] = useState('')
    const navigate = useNavigate()
    const {width} = useWindowSize()
    const { data, fetchError, isLoading } = useAxiosFetch('http://localhost:3500/Posts');

    useEffect(() => {   //useAxiosFetch
        setPosts(data);
    }, [data])

    useEffect(() => {   //useWindowSize
        const filteredResults = posts.filter((post) => 
        ((post.body).toLowerCase()).includes(search.toLowerCase()) 
        || ((post.title).toLowerCase()).includes(search.toLowerCase()));
        
        setSearchResults(filteredResults.reverse());
    }, [posts, search])

    const handleSubmit = async (e) => {  //submit button
        e.preventDefault();
        const id = posts.length ? posts[posts.length - 1].id + 1 : 1;
        const datetime = format(new Date(), 'MMMM dd, yyyy pp');
        const newPost = { id, title: postTitle, datetime, body: postBody};
        try {
        const response = await api.post('Posts', newPost);
        const allPosts = [...posts, response.data];
        setPosts(allPosts);
        setPostTitle('');
        setPostBody('');
        navigate('/')
        } catch (err) {
            console.log(`Error: ${err.message}`);
        }
    } 

    const handleEdit =  async (id) => {  //edit button 
        const datetime = format(new Date(), 'MMMM dd, yyyy pp');
        const updatedPost = { id, title: editTitle, datetime, body: editBody};
        try {
        const response = await api.put(`/Posts/${id}`, updatedPost)
        setPosts(posts.map(post => post.id===id ? {...response.data} : post));
        setEditTitle('');
        setEditBody('');
        navigate('/')
        } catch (err) {
        console.log(`Error: ${err.message}`);
        }
    }
    
    const handleDelete = async (id) => {    //delete button
        try {
        await api.delete(`/Posts/${id}`)
        const postsList = posts.filter(post => post.id !== id);
        setPosts(postsList);
        navigate('/')
        } catch (err) {
        console.log(`Error: ${err.message}`);
        }
        
    }
    return (
        <DataContext.Provider value={{
            width, search, setSearch, searchResults, fetchError, isLoading, handleSubmit, postTitle, setPostTitle, postBody, setPostBody,
            posts, handleEdit, editBody, setEditBody, editTitle, setEditTitle,
            handleDelete, 

        }}>
            {children}
        </DataContext.Provider>
    )
}

export default DataContext;