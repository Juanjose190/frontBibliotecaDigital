import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import BookList from './components/books/BookList';
import BookForm from './components/books/BookForm';
import BookDetail from './components/books/BookDetail';
import CategoryList from './components/categories/CategoryList';
import CategoryForm from './components/categories/CategoryForm';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import UserDetail from './components/users/UserDetail';
import LoanList from './components/loans/LoanList';
import LoanForm from './components/loans/LoanForm';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Book Routes */}
            <Route path="/books" element={<BookList />} />
            <Route path="/books/new" element={<BookForm />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/books/:id/edit" element={<BookForm />} />
            
            {/* Category Routes */}
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/categories/new" element={<CategoryForm />} />
            <Route path="/categories/edit/:categoryId" element={<CategoryForm />} />

            
            {/* User Routes */}
            <Route path="/users" element={<UserList />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/users/:id/edit" element={<UserForm />} />
            
            {/* Loan Routes */}
            <Route path="/loans" element={<LoanList />} />
            <Route path="/loans/new" element={<LoanForm />} />
            <Route path="/loans/edit/:id" element={<LoanForm />} />
       

          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;