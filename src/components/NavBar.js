import { Link, NavLink } from "react-router-dom";

function NavBar() {
    return (
        <nav className="navbar navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">Home</Link>
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <NavLink className={({ isActive }) =>
                            [
                                'nav-link',
                                isActive ? 'active' : undefined
                            ]
                            .filter(Boolean)
                            .join(" ")
                        } aria-current="page" to="/blogs">
                            Blogs
                        </NavLink>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default NavBar;