import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import useToast from '../hooks/toast';

function BlogList({ isAdmin }) {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const pageParam = params.get('page');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [numberOfPosts, setNumberOfPosts] = useState(0);
    const [numberOfPages, setNumberOfPages] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState('');
    const { addToast } = useToast();
    const limit = 5;

    const getPosts = useCallback(async (page = 1) => {
        let params = {
            _page: page,
            _limit: limit,
            _sort: 'id',
            _order: 'desc',
            title_like: searchText
        }

        if (!isAdmin) {
            params.publish = true
        }

        try {
            const response = await axios.get('http://localhost:3001/posts', {
                params
            })
            setNumberOfPosts(response.headers['x-total-count'])
            setPosts(response.data);
        } catch (error) {
            setError('Something went wrong in database');
            addToast({
                text: 'Something went wrong',
                type: 'danger'
            });
        } finally {
            setLoading(false);
        }
    }, [isAdmin, searchText])
    
    useEffect(() => {
        setCurrentPage(parseInt(pageParam) || 1);
        getPosts(parseInt(pageParam) || 1);
    }, []);

    useEffect(() => {
        setNumberOfPages(Math.ceil(numberOfPosts/limit));
    }, [numberOfPosts]);

    const onSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`${location.pathname}?page=1`)
            setCurrentPage(1)
            getPosts(1);
        }
    }

    const onClickPageButtn = (page) => {
        navigate(`${location.pathname}?page=${page}`)
        setCurrentPage(page);
        getPosts(page)
    }

    const deleteBlog = async (e, id) => {
        e.stopPropagation();

        try {
            await axios.delete(`http://localhost:3001/posts/${id}`);
            // setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
            getPosts(1);
            addToast({
                text: 'Successfully deleted',
                type: 'success'
            });
        } catch (error) {
            addToast({
                text: 'The blog could not be deleted.',
                type: 'danger'
            });
        }
    }

    if (loading) {
        return <LoadingSpinner />
    }

    const renderBlogList = () => {
        return (
            posts.map((post) => {
                return (
                    <Card key={post.id} title={post.title} onClick={() => navigate(`/blogs/${post.id}`)}>
                        <div>
                            {isAdmin ? <button 
                                className='btn btn-danger btn-sm' 
                                onClick={(e) => deleteBlog(e, post.id)}
                            >
                                Delete
                            </button> : null}
                        </div>
                    </Card>
                )
            })
        )
    }

    if (error) {
        return <div>{error}</div>
    }

    return (
        <div>
            <input 
                className='form-control' 
                type="text" 
                placeholder='Search.'
                value={searchText}
                onChange={(e) => {
                    setSearchText(e.target.value)
                }}
                onKeyUp={onSearch}
            />
            <hr />
            {!posts.length 
                ? <div>'No blog posts found'</div> 
                : <>
                    {renderBlogList()}
                    {numberOfPages > 1 && <Pagination 
                        currentPage={currentPage} 
                        numberOfPages={numberOfPages} 
                        onClick={onClickPageButtn} />
                    }
                </>
            }
        </div>
    )
}

BlogList.propTypes = {
    isAdmin: PropTypes.bool
};

BlogList.defaultProps = {
    isAdmin: false
}

export default BlogList;