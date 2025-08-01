import React, { useState, useEffect, useCallback } from 'react';

import { Plus, Edit, Trash2, X, CheckCircle, AlertCircle, DollarSign, FileText, Download } from 'lucide-react'; // Added Download icon

import '../styles/financeManagementModule.css'; // Import the vanilla CSS file
import { useNavigate } from 'react-router-dom';

// --- Utility Functions ---

const validatePaymentForm = (formData) => {
    const errors = {};
    if (!formData.project_id) errors.project_id = 'Project is required.';
    if (!formData.client_id) errors.client_id = 'Client is required.';
    if (isNaN(parseFloat(formData.paidAmount)) || parseFloat(formData.paidAmount) <= 0) {
        errors.paidAmount = 'Valid Paid Amount is required and must be a positive number.';
    }
    if (!formData.payment_date) errors.payment_date = 'Payment Date is required.';
    if (!formData.payment_method) errors.payment_method = 'Payment Method is required.';
    return errors;
};

// Validate Expense Form
const validateExpenseForm = (formData) => {
    const errors = {};
    if (!formData.category) errors.category = 'Category is required.';
    if (!formData.description) errors.description = 'Description is required.';
    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
        errors.amount = 'Valid Amount is required and must be a positive number.';
    }
    if (!formData.expense_date) errors.expense_date = 'Expense Date is required.';
    if (!formData.payment_method) errors.payment_method = 'Payment Method is required.';
    return errors;
};

// New: Validate Salary Form
const validateSalaryForm = (formData) => {
    const errors = {};
    if (!formData.employee_id) errors.employee_id = 'Employee is required.';
    if (!formData.salary_month) errors.salary_month = 'Month is required.';
    if (!formData.salary_year) errors.salary_year = 'Year is required.';
    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
        errors.amount = 'Valid Amount is required and must be a positive number.';
    }
    if (!formData.payment_date) errors.payment_date = 'Payment Date is required.';
    if (!formData.payment_method) errors.payment_method = 'Payment Method is required.';

    // Basic date validation (already handled by type="date" but good for robustness)
    if (formData.payment_date && isNaN(new Date(formData.payment_date).getTime())) {
        errors.payment_date = 'Invalid payment date.';
    }

    return errors;
};

// New: Validate Salary Report Form
const validateSalaryReportForm = (formData) => {
    const errors = {};
    if (!formData.id) errors.id = 'Employee is required.';
    if (!formData.month) errors.month = 'Month is required.';
    if (!formData.year) errors.year = 'Year is required.';
    if (isNaN(parseInt(formData.year)) || parseInt(formData.year) < 2000 || parseInt(formData.year) > new Date().getFullYear() + 5) {
        errors.year = 'Valid Year is required.';
    }
    return errors;
};

// --- FinanceManager Component ---
export default function FinanceManager() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [projects, setProjects] = useState([]); // To fetch projects for dropdown
    const [clients, setClients] = useState([]);   // To fetch clients for dropdown
    const [expenses, setExpenses] = useState([]); // State for expenses
    const [users, setUsers] = useState([]);       // State for users (for approved_by dropdown)
    const [salaryPayments, setSalaryPayments] = useState([]); // New: State for salary payments
    const [employees, setEmployees] = useState([]); // New: To fetch employees for salary dropdown

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState(''); // 'create_payment', 'edit_payment', 'delete_payment', 'create_expense', 'edit_expense', 'delete_expense', 'create_salary', 'edit_salary', 'delete_salary', 'export_pdf_dates', 'export_salary_pdf'
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [selectedSalaryPayment, setSelectedSalaryPayment] = useState(null); // New: For salary operations

    const [paymentFormData, setPaymentFormData] = useState({
        project_id: '', client_id: '', paidAmount: '', payment_date: '',
        payment_method: '', payment_status: 'unpaid', reference_number: '',
        invoice_file: '', notes: '',
    });

    const [expenseFormData, setExpenseFormData] = useState({
        category: '', description: '', amount: '', expense_date: '',
        payment_method: '', receipt_file: '', approved_by: '',
    });

    const [salaryFormData, setSalaryFormData] = useState({ // New: Salary Form Data
        employee_id: '',
        salary_month: '',
        salary_year: '',
        amount: '',
        payment_date: '',
        payment_method: '',
        reference_number: '',
        notes: '',
    });

    // New: State for PDF report dates (Expense Report)
    const [reportDates, setReportDates] = useState({
        startDate: '',
        endDate: '',
    });

    // New: State for Salary PDF report data
    const [salaryReportData, setSalaryReportData] = useState({
        employee_id: '',
        month: new Date().getMonth() + 1, // Default to current month
        year: new Date().getFullYear(), // Default to current year
    });

    const [validationErrors, setValidationErrors] = useState({});
    const [toast, setToast] = useState({ show: false, message: '', type: '' });

    const API_BASE_URL = 'http://localhost:5000';

    // Show Toast Message Helper
    const showToastMessage = useCallback((message, type) => {
        setToast({ show: true, message, type });
    }, []);

    // Fetch Payments
    const fetchPayments = useCallback(async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/payment/all`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            const result = await response.json();
            if (Array.isArray(result)) {
                setPayments(result);
            } else {
                throw new Error(result.message || 'Unexpected data format from payment API.');
            }
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }

            console.error('Failed to fetch payments:', err);
            showToastMessage('Failed to load payments.', 'error');
            setError('Failed to load payments. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [showToastMessage]);

    // Fetch Projects (for dropdowns)
    const fetchProjects = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/project/all`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw await response.json();
            }
            const data = await response.json();
            setProjects(data);
        } catch (err) {

            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }

            console.error('Failed to fetch projects:', err);
            showToastMessage('Failed to load projects for linking.', 'error');
        }
    }, []);

    // Fetch Clients (for dropdowns)
    const fetchClients = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/client/all`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setClients(result.data);
            } else {
                throw new Error(result.message || 'Unexpected data format from client API.');
            }
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
            console.error('Failed to fetch clients:', err);
            showToastMessage('Failed to load clients for linking.', 'error');
        }
    }, []);

    // Fetch Expenses
    const fetchExpenses = useCallback(async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/expense/all`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            const result = await response.json();
            if (result.success && Array.isArray(result.expenses)) {
                setExpenses(result.expenses);
            } else {
                throw new Error(result.message || 'Unexpected data format from expense API.');
            }
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
            console.error('Failed to fetch expenses:', err);
            showToastMessage('Failed to load expenses.', 'error');
            setError('Failed to load expenses. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [showToastMessage]);

    // Fetch Users (for approved_by dropdown in expenses)
    const fetchUsers = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/users/all`, { // Adjust this endpoint if different
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setUsers(result.data);
            } else if (result.success && Array.isArray(result.users)) {
                setUsers(result.users);
            } else if (Array.isArray(result)) { // If the API directly returns an array
                setUsers(result);
            } else {
                throw new Error(result.message || 'Unexpected data format from user API.');
            }
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
            console.error('Failed to fetch users:', err);
            showToastMessage('Failed to load users for approval.', 'error');
        }
    }, [showToastMessage]);

    // New: Fetch Salary Payments
    const fetchSalaryPayments = useCallback(async () => {
        const token = localStorage.getItem("token");
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/salary/all`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
                setSalaryPayments(result.data);
            } else {
                throw new Error(result.message || 'Unexpected data format from salary API.');
            }
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }

            console.error('Failed to fetch salary payments:', err);
            showToastMessage('Failed to load salary payments.', 'error');
            setError('Failed to load salary payments. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [showToastMessage]);

    // New: Fetch Employees (for salary dropdown)
    const fetchEmployees = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE_URL}/employee/all`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw await response.json();
            }
            const data = await response.json();
            setEmployees(data); // Assuming /employee/all returns an array of employee objects
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
            console.error('Failed to fetch employees for dropdown:', err);
            showToastMessage('Failed to load employee list for forms.', 'error');
        }
    }, [showToastMessage]);


    useEffect(() => {
        fetchPayments();
        fetchProjects();
        fetchClients();
        fetchExpenses();
        fetchUsers();
        fetchSalaryPayments(); // Fetch salary payments on mount
        fetchEmployees(); // Fetch employees for salary dropdown on mount
    }, [fetchPayments, fetchProjects, fetchClients, fetchExpenses, fetchUsers, fetchSalaryPayments, fetchEmployees]);

    // Toast message timeout
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 3000); // Hide toast after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    // Handle Form Input Changes for Payment Form
    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Handle Form Input Changes for Expense Form
    const handleExpenseChange = (e) => {
        const { name, value } = e.target;
        setExpenseFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // New: Handle Form Input Changes for Salary Form
    const handleSalaryChange = (e) => {
        const { name, value } = e.target;
        setSalaryFormData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // New: Handle Expense Report Dates Change
    const handleReportDatesChange = (e) => {
        const { name, value } = e.target;
        setReportDates(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // New: Handle Salary Report Data Change
    const handleSalaryReportDataChange = (e) => {
        const { name, value } = e.target;
        setSalaryReportData(prev => ({ ...prev, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Open Modal for Payment/Expense/Salary/Report Operations
    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setValidationErrors({}); // Clear previous validation errors
        setSelectedPayment(null); // Clear previous selections
        setSelectedExpense(null); // Clear previous selections
        setSelectedSalaryPayment(null); // Clear previous selections

        if (mode.includes('payment')) {
            setSelectedPayment(item);
            if (mode === 'create_payment') {
                setPaymentFormData({
                    project_id: '', client_id: '', paidAmount: '', payment_date: new Date().toISOString().split('T')[0],
                    payment_method: '', payment_status: 'unpaid', reference_number: '',
                    invoice_file: '', notes: '',
                });
            } else if (mode === 'edit_payment' && item) {
                setPaymentFormData({
                    ...item,
                    paidAmount: String(item.paidAmount),
                    payment_date: item.payment_date ? new Date(item.payment_date).toISOString().split('T')[0] : '',
                });
            }
        } else if (mode.includes('expense')) {
            setSelectedExpense(item);
            if (mode === 'create_expense') {
                setExpenseFormData({
                    category: '', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0],
                    payment_method: '', receipt_file: '', approved_by: '',
                });
            } else if (mode === 'edit_expense' && item) {
                setExpenseFormData({
                    ...item,
                    amount: String(item.amount),
                    expense_date: item.expense_date ? new Date(item.expense_date).toISOString().split('T')[0] : '',
                    approved_by: item.approved_by || '',
                });
            }
        } else if (mode.includes('salary')) { // New: Salary related modals
            setSelectedSalaryPayment(item);
            if (mode === 'create_salary') {
                setSalaryFormData({
                    employee_id: '',
                    salary_month: new Date().getMonth() + 1, // Current month
                    salary_year: new Date().getFullYear(),   // Current year
                    amount: '',
                    payment_date: new Date().toISOString().split('T')[0], // Current date
                    payment_method: '',
                    reference_number: '',
                    notes: '',
                });
            } else if (mode === 'edit_salary' && item) {
                setSalaryFormData({
                    ...item,
                    amount: String(item.amount), // Ensure amount is string for input
                    payment_date: item.payment_date ? new Date(item.payment_date).toISOString().split('T')[0] : '',
                });
            }
        } else if (mode === 'export_pdf_dates') { // For Expense PDF export date selection
            const today = new Date();
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            setReportDates({
                startDate: firstDayOfMonth.toISOString().split('T')[0],
                endDate: today.toISOString().split('T')[0],
            });
        } else if (mode === 'export_salary_pdf') { // New: For Salary PDF export selection
            setSalaryReportData({
                id: '',
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
            });
        }
        setShowModal(true);
    };

    // Close Modal
    const closeModal = () => {
        setShowModal(false);
        setModalMode('');
        setSelectedPayment(null);
        setSelectedExpense(null);
        setSelectedSalaryPayment(null); // Clear selected salary payment
        setValidationErrors({});
        setReportDates({ startDate: '', endDate: '' }); // Clear expense report dates on close
        setSalaryReportData({ // Clear salary report data on close
            id: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
        });
    };

    // Handle Add/Edit Payment Submission
    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = { ...paymentFormData };
        dataToSubmit.paidAmount = parseFloat(dataToSubmit.paidAmount);
        dataToSubmit.payment_date = dataToSubmit.payment_date.replace(/-/g, '/');

        const errors = validatePaymentForm(dataToSubmit);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            showToastMessage('Please correct the form errors.', 'error');
            return;
        }

        setLoading(true);
        try {
            let response;
            const token = localStorage.token;
            if (modalMode === 'create_payment') {
                response = await fetch(`${API_BASE_URL}/payment/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(dataToSubmit),
                });
            } else if (modalMode === 'edit_payment' && selectedPayment) {
                response = await fetch(`${API_BASE_URL}/payment/edit/${selectedPayment.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(dataToSubmit),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            showToastMessage(`Payment ${modalMode === 'create_payment' ? 'added' : 'updated'} successfully!`, 'success');
            closeModal();
            fetchPayments();
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }

            console.error(`Failed to ${modalMode} payment:`, err);
            setError(`Failed to ${modalMode} payment: ${err.message}`);
            showToastMessage(`Failed to ${modalMode} payment.`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete Payment
    const handleDeletePayment = async () => {
        if (!selectedPayment) return;

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/payment/delete/${selectedPayment.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            showToastMessage('Payment deleted successfully!', 'success');
            closeModal();
            fetchPayments();
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
            console.error('Failed to delete payment:', err);
            setError(`Failed to delete payment: ${err.message}`);
            showToastMessage('Failed to delete payment.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Add/Edit Expense Submission
    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = { ...expenseFormData };
        dataToSubmit.amount = parseFloat(dataToSubmit.amount);
        dataToSubmit.expense_date = dataToSubmit.expense_date.replace(/-/g, '/');
        // Convert approved_by to null if empty string, assuming it's an INT in DB
        if (dataToSubmit.approved_by === '') {
            dataToSubmit.approved_by = null;
        } else {
            dataToSubmit.approved_by = parseInt(dataToSubmit.approved_by, 10);
        }

        const errors = validateExpenseForm(dataToSubmit);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            showToastMessage('Please correct the form errors.', 'error');
            return;
        }

        setLoading(true);
        try {
            let response;
            const token = localStorage.token;
            if (modalMode === 'create_expense') {
                response = await fetch(`${API_BASE_URL}/expense/add`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(dataToSubmit),
                });
            } else if (modalMode === 'edit_expense' && selectedExpense) {
                const expenseDataToSend = {
                    category: dataToSubmit.category,
                    description: dataToSubmit.description,
                    amount: dataToSubmit.amount,
                    expense_date: dataToSubmit.expense_date,
                    payment_method: dataToSubmit.payment_method,
                    receipt_file: dataToSubmit.receipt_file,
                    approved_by: dataToSubmit.approved_by,
                };
                response = await fetch(`${API_BASE_URL}/expense/edit/${selectedExpense.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(expenseDataToSend),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            showToastMessage(`Expense ${modalMode === 'create_expense' ? 'added' : 'updated'} successfully!`, 'success');
            closeModal();
            fetchExpenses();
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }

            console.error(`Failed to ${modalMode} expense:`, err);
            setError(`Failed to ${modalMode} expense: ${err.message}`);
            showToastMessage(`Failed to ${modalMode} expense.`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete Expense
    const handleDeleteExpense = async () => {
        if (!selectedExpense) return;

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/expense/delete/${selectedExpense.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            showToastMessage('Expense deleted successfully!', 'success');
            closeModal();
            fetchExpenses();
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }
            
            console.error('Failed to delete expense:', err);
            setError(`Failed to delete expense: ${err.message}`);
            showToastMessage('Failed to delete expense.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // New: Handle Add/Edit Salary Submission
    const handleSalarySubmit = async (e) => {
        e.preventDefault();
        
        const dataToSubmit = { ...salaryFormData };
        dataToSubmit.amount = parseFloat(dataToSubmit.amount);
        dataToSubmit.employee_id = parseInt(dataToSubmit.employee_id, 10);
        dataToSubmit.salary_month = parseInt(dataToSubmit.salary_month, 10);
        dataToSubmit.salary_year = parseInt(dataToSubmit.salary_year, 10);
        // Date format for backend (YYYY-MM-DD or similar, usually handled by backend)
        dataToSubmit.payment_date = dataToSubmit.payment_date.replace(/-/g, '/');

        const errors = validateSalaryForm(dataToSubmit);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            showToastMessage('Please correct the form errors.', 'error');
            return;
        }

        setLoading(true);
        try {
            let response;
            const token = localStorage.token;
            if (modalMode === 'create_salary') {
                response = await fetch(`${API_BASE_URL}/salary/add`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        "Authorization":`Bearer ${token}`
                    },
                    body: JSON.stringify(dataToSubmit),
                });
            } else if (modalMode === 'edit_salary' && selectedSalaryPayment) {
                response = await fetch(`${API_BASE_URL}/salary/edit/${selectedSalaryPayment.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        "Authorization":`Bearer ${token}`
                    },
                    body: JSON.stringify(dataToSubmit),
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            showToastMessage(`Salary payment ${modalMode === 'create_salary' ? 'added' : 'updated'} successfully!`, 'success');
            closeModal();
            fetchSalaryPayments(); // Re-fetch data to update the list
        } catch (err) {

            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }

            console.error(`Failed to ${modalMode} salary payment:`, err);
            setError(`Failed to ${modalMode} salary payment: ${err.message}`);
            showToastMessage(`Failed to ${modalMode} salary payment.`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // New: Handle Delete Salary Payment
    const handleDeleteSalary = async () => {
        if (!selectedSalaryPayment) return;

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/salary/delete/${selectedSalaryPayment.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw errorData;
            }

            showToastMessage('Salary payment deleted successfully!', 'success');
            closeModal();
            fetchSalaryPayments(); // Re-fetch data to update the list
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }

            console.error('Failed to delete salary payment:', err);
            setError(`Failed to delete salary payment: ${err.message}`);
            showToastMessage('Failed to delete salary payment.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // New: Handle Export PDF for Expenses
    const handleExportPdf = async (e) => {
        e.preventDefault();
        const { startDate, endDate } = reportDates;

        if (!startDate || !endDate) {
            setValidationErrors({ startDate: 'Start date is required.', endDate: 'End date is required.' });
            showToastMessage('Please select both start and end dates.', 'error');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            setValidationErrors({ endDate: 'End date cannot be before start date.' });
            showToastMessage('End date cannot be before start date.', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/expense/get-report/${startDate}/${endDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json(); // Get raw text for better debugging
                console.error('PDF Report Error Response:', errorData);
                throw errorData;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank'); // Open PDF in a new tab

            showToastMessage('Expense report generated successfully!', 'success');
            closeModal();
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }

            console.error('Error generating PDF report:', err);
            setError(`Failed to generate PDF report: ${err.message}`);
            showToastMessage(`Failed to generate PDF report: ${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    // New: Handle Export Salary PDF
    const handleExportSalaryPdf = async (e) => {
        e.preventDefault();
        const { id, month, year } = salaryReportData;

        const errors = validateSalaryReportForm(salaryReportData);
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            showToastMessage('Please correct the form errors.', 'error');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.token;
            const response = await fetch(`${API_BASE_URL}/salary/report/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ month: parseInt(month, 10), year: parseInt(year, 10) }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Salary PDF Report Error Response:', errorData);
                throw errorData
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank'); // Open PDF in a new tab

            showToastMessage('Salary report generated successfully!', 'success');
            closeModal();
        } catch (err) {
            if(err.hasOwnProperty('tokenVerified')){
                if(err.tokenVerified===false){
                    navigate("/login");
                }
            }

            console.error('Error generating Salary PDF report:', err);
            setError(`Failed to generate Salary PDF report: ${err.message}`);
            showToastMessage(`${err.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };


    // Helper to get project title by ID
    const getProjectTitle = (projectId) => {
        const project = projects.find(p => p.id === projectId);
        return project ? project.title : 'N/A';
    };

    // Helper to get client name by ID
    const getClientName = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        return client ? client.name : 'N/A';
    };

    // Helper to get user name by ID (for expenses)
    const getUserName = (userId) => {
        if (!Array.isArray(users)) {
            console.warn("Users data is not an array, cannot get user name.");
            return 'N/A';
        }
        const user = users.find(u => u.id === userId);
        return user ? `${user.firstName} ${user.lastName}` : 'N/A';
    };

    // New: Helper to get employee name by employee_id (from the fetched employees list)
    const getEmployeeName = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? `${employee.firstName} ${employee.lastName}` : 'N/A';
    };

    // New: Helper to get employee system_employee_id by employee_id
    const getSystemEmployeeId = (employeeId) => {
        const employee = employees.find(emp => emp.id === employeeId);
        return employee ? employee.employee_id : 'N/A';
    };

    // New: Helper to get month name
    const getMonthName = (monthNumber) => {
        const date = new Date(2000, monthNumber - 1, 1); // Use a dummy date
        return date.toLocaleString('en-US', { month: 'long' });
    };


    // Render Modal Content
    const renderModalContent = () => {
        // Determine if the current modal is a form that should be narrower
        const isNarrowFormModal = modalMode === 'create_payment' || modalMode === 'edit_payment' ||
                                  modalMode === 'create_expense' || modalMode === 'edit_expense' ||
                                  modalMode === 'create_salary' || modalMode === 'edit_salary' ||
                                  modalMode === 'export_pdf_dates' || modalMode === 'export_salary_pdf'; // New: include salary PDF export form
        const modalContentClasses = `modal-content animate-scaleIn ${isNarrowFormModal ? 'modal-content-form-narrow' : ''}`;

        switch (modalMode) {
            case 'create_payment':
            case 'edit_payment':
                const isEditPayment = modalMode === 'edit_payment';
                return (
                    <div className={modalContentClasses}>
                        <button
                            onClick={closeModal}
                            className="modal-close-button"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                        <form onSubmit={handlePaymentSubmit} className="modal-form">
                            <h2 className="modal-title">
                                {isEditPayment ? 'Edit Payment' : 'Record New Payment'}
                            </h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="paymentProjectId">Project</label>
                                    <select
                                        id="paymentProjectId" name="project_id" value={paymentFormData.project_id}
                                        onChange={handlePaymentChange}
                                        className={`form-select ${validationErrors.project_id ? 'input-error' : ''}`}
                                        required
                                    >
                                        <option value="">Select a Project</option>
                                        {projects.map(project => (
                                            <option key={project.id} value={project.id}>{project.title}</option>
                                        ))}
                                    </select>
                                    {validationErrors.project_id && <p className="error-message">{validationErrors.project_id}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="paymentClientId">Client</label>
                                    <select
                                        id="paymentClientId" name="client_id" value={paymentFormData.client_id}
                                        onChange={handlePaymentChange}
                                        className={`form-select ${validationErrors.client_id ? 'input-error' : ''}`}
                                        required
                                    >
                                        <option value="">Select a Client</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.name}</option>
                                        ))}
                                    </select>
                                    {validationErrors.client_id && <p className="error-message">{validationErrors.client_id}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="paidAmount">Paid Amount ($)</label>
                                    <input
                                        type="number" id="paidAmount" name="paidAmount" value={paymentFormData.paidAmount}
                                        onChange={handlePaymentChange}
                                        className={`form-input ${validationErrors.paidAmount ? 'input-error' : ''}`}
                                        required step="0.01" min="0"
                                    />
                                    {validationErrors.paidAmount && <p className="error-message">{validationErrors.paidAmount}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="paymentDate">Payment Date</label>
                                    <input
                                        type="date" id="paymentDate" name="payment_date" value={paymentFormData.payment_date}
                                        onChange={handlePaymentChange}
                                        className={`form-input ${validationErrors.payment_date ? 'input-error' : ''}`}
                                        required
                                    />
                                    {validationErrors.payment_date && <p className="error-message">{validationErrors.payment_date}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="paymentMethod">Payment Method</label>
                                    <select
                                        id="paymentMethod" name="payment_method" value={paymentFormData.payment_method}
                                        onChange={handlePaymentChange}
                                        className={`form-select ${validationErrors.payment_method ? 'input-error' : ''}`}
                                        required
                                    >
                                        <option value="">Select Method</option>
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="jazzcash">JazzCash</option>
                                        <option value="easypaisa">EasyPaisa</option>
                                        <option value="paypal">PayPal</option>
                                        <option value="stripe">Stripe</option>
                                        <option value="cheque">Cheque</option>
                                    </select>
                                    {validationErrors.payment_method && <p className="error-message">{validationErrors.payment_method}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="paymentStatus">Payment Status</label>
                                    <select
                                        id="paymentStatus" name="payment_status" value={paymentFormData.payment_status}
                                        onChange={handlePaymentChange} className="form-select"
                                    >
                                        <option value="unpaid">Unpaid</option>
                                        <option value="partial">Partial</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="referenceNumber">Reference Number</label>
                                    <input
                                        type="text" id="referenceNumber" name="reference_number" value={paymentFormData.reference_number}
                                        onChange={handlePaymentChange} className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="invoiceFile">Invoice File URL</label>
                                    <input
                                        type="text" id="invoiceFile" name="invoice_file" value={paymentFormData.invoice_file}
                                        onChange={handlePaymentChange} className="form-input"
                                    />
                                </div>
                                <div className="form-group form-group-full">
                                    <label htmlFor="paymentNotes">Notes</label>
                                    <textarea
                                        id="paymentNotes" name="notes" value={paymentFormData.notes}
                                        onChange={handlePaymentChange} rows="2" className="form-textarea"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="button button-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="button button-primary" disabled={loading}>
                                    {loading ? 'Saving...' : (isEditPayment ? 'Update Payment' : 'Record Payment')}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'delete_payment':
                return (
                    <div className={modalContentClasses}>
                        <button
                            onClick={closeModal}
                            className="modal-close-button"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                        <div className="delete-modal-content">
                            <h2 className="modal-title">Confirm Payment Deletion</h2>
                            <p className="modal-text">
                                Are you sure you want to delete payment for project{' '}
                                <span className="project-title-display">"{getProjectTitle(selectedPayment?.project_id)}"</span> (ID: {selectedPayment?.id})?
                                This action cannot be undone.
                            </p>
                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} className="button button-secondary">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleDeletePayment} className="button button-danger" disabled={loading}>
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'create_expense':
            case 'edit_expense':
                const isEditExpense = modalMode === 'edit_expense';
                return (
                    <div className={modalContentClasses}>
                        <button
                            onClick={closeModal}
                            className="modal-close-button"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                        <form onSubmit={handleExpenseSubmit} className="modal-form">
                            <h2 className="modal-title">
                                {isEditExpense ? 'Edit Expense' : 'Record New Expense'}
                            </h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="expenseCategory">Category</label>
                                    <select
                                        id="expenseCategory" name="category" value={expenseFormData.category}
                                        onChange={handleExpenseChange}
                                        className={`form-select ${validationErrors.category ? 'input-error' : ''}`}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="utilities">Utilities</option>
                                        <option value="marketing">Marketing</option>
                                        <option value="software">Software</option>
                                        <option value="office_supplies">Office Supplies</option>
                                        <option value="transport">Transport</option>
                                        <option value="internet">Internet</option>
                                        <option value="rent">Rent</option>
                                        <option value="food">Food</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="miscellaneous">Miscellaneous</option>
                                    </select>
                                    {validationErrors.category && <p className="error-message">{validationErrors.category}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="expenseAmount">Amount ($)</label>
                                    <input
                                        type="number" id="expenseAmount" name="amount" value={expenseFormData.amount}
                                        onChange={handleExpenseChange}
                                        className={`form-input ${validationErrors.amount ? 'input-error' : ''}`}
                                        required step="0.01" min="0"
                                    />
                                    {validationErrors.amount && <p className="error-message">{validationErrors.amount}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="expenseDate">Expense Date</label>
                                    <input
                                        type="date" id="expenseDate" name="expense_date" value={expenseFormData.expense_date}
                                        onChange={handleExpenseChange}
                                        className={`form-input ${validationErrors.expense_date ? 'input-error' : ''}`}
                                        required
                                    />
                                    {validationErrors.expense_date && <p className="error-message">{validationErrors.expense_date}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="expensePaymentMethod">Payment Method</label>
                                    <select
                                        id="expensePaymentMethod" name="payment_method" value={expenseFormData.payment_method}
                                        onChange={handleExpenseChange}
                                        className={`form-select ${validationErrors.payment_method ? 'input-error' : ''}`}
                                        required
                                    >
                                        <option value="">Select Method</option>
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="jazzcash">JazzCash</option>
                                        <option value="easypaisa">EasyPaisa</option>
                                        <option value="card">Card</option>
                                        <option value="cheque">Cheque</option>
                                    </select>
                                    {validationErrors.payment_method && <p className="error-message">{validationErrors.payment_method}</p>}
                                </div>
                                <div className="form-group form-group-full">
                                    <label htmlFor="expenseDescription">Description</label>
                                    <textarea
                                        id="expenseDescription" name="description" value={expenseFormData.description}
                                        onChange={handleExpenseChange} rows="2" className="form-textarea"
                                        required
                                    ></textarea>
                                    {validationErrors.description && <p className="error-message">{validationErrors.description}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="receiptFile">Receipt File URL</label>
                                    <input
                                        type="text" id="receiptFile" name="receipt_file" value={expenseFormData.receipt_file}
                                        onChange={handleExpenseChange} className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="approvedBy">Approved By</label>
                                    <select
                                        id="approvedBy" name="approved_by" value={expenseFormData.approved_by}
                                        onChange={handleExpenseChange} className="form-select"
                                    >
                                        <option value="">Select User (Optional)</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.firstName} {user.lastName} ({user.role.replace(/_/g, ' ')})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="button button-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="button button-primary" disabled={loading}>
                                    {loading ? 'Saving...' : (isEditExpense ? 'Update Expense' : 'Record Expense')}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'delete_expense':
                return (
                    <div className={modalContentClasses}>
                        <button
                            onClick={closeModal}
                            className="modal-close-button"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                        <div className="delete-modal-content">
                            <h2 className="modal-title">Confirm Expense Deletion</h2>
                            <p className="modal-text">
                                Are you sure you want to delete the expense for category{' '}
                                <span className="project-title-display">"{selectedExpense?.category}"</span> (ID: {selectedExpense?.id})?
                                This action cannot be undone.
                            </p>
                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} className="button button-secondary">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleDeleteExpense} className="button button-danger" disabled={loading}>
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'create_salary': // New: Salary Create/Edit Modal
            case 'edit_salary':
                const isEditSalary = modalMode === 'edit_salary';
                return (
                    <div className={modalContentClasses}>
                        <button
                            onClick={closeModal}
                            className="modal-close-button"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                        <form onSubmit={handleSalarySubmit} className="modal-form">
                            <h2 className="modal-title">
                                {isEditSalary ? 'Edit Salary Payment' : 'Record New Salary Payment'}
                            </h2>
                            <div className="form-grid">
                                {/* Employee */}
                                <div className="form-group">
                                    <label htmlFor="salaryEmployeeId">Employee</label>
                                    <select
                                        id="salaryEmployeeId"
                                        name="employee_id"
                                        value={salaryFormData.employee_id}
                                        onChange={handleSalaryChange}
                                        className={`form-select ${validationErrors.employee_id ? 'input-error' : ''}`}
                                        required
                                        disabled={isEditSalary} // Employee cannot be changed when editing
                                    >
                                        <option value="">Select an Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.firstName} {emp.lastName} (ID: {emp.employee_id})
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.employee_id && <p className="error-message">{validationErrors.employee_id}</p>}
                                </div>
                                {/* Salary Month */}
                                <div className="form-group">
                                    <label htmlFor="salaryMonth">Month</label>
                                    <select
                                        id="salaryMonth"
                                        name="salary_month"
                                        value={salaryFormData.salary_month}
                                        onChange={handleSalaryChange}
                                        className={`form-select ${validationErrors.salary_month ? 'input-error' : ''}`}
                                        required
                                        disabled={isEditSalary} // Month/Year cannot be changed when editing
                                    >
                                        <option value="">Select Month</option>
                                        {[...Array(12).keys()].map(i => (
                                            <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                                        ))}
                                    </select>
                                    {validationErrors.salary_month && <p className="error-message">{validationErrors.salary_month}</p>}
                                </div>
                                {/* Salary Year */}
                                <div className="form-group">
                                    <label htmlFor="salaryYear">Year</label>
                                    <input
                                        type="number"
                                        id="salaryYear"
                                        name="salary_year"
                                        value={salaryFormData.salary_year}
                                        onChange={handleSalaryChange}
                                        className={`form-input ${validationErrors.salary_year ? 'input-error' : ''}`}
                                        required
                                        min="2000" // Adjust as needed
                                        max={new Date().getFullYear() + 5} // Adjust as needed
                                        disabled={isEditSalary} // Month/Year cannot be changed when editing
                                    />
                                    {validationErrors.salary_year && <p className="error-message">{validationErrors.salary_year}</p>}
                                </div>
                                {/* Amount */}
                                <div className="form-group">
                                    <label htmlFor="salaryAmount">Amount ($)</label>
                                    <input
                                        type="number"
                                        id="salaryAmount"
                                        name="amount"
                                        value={salaryFormData.amount}
                                        onChange={handleSalaryChange}
                                        className={`form-input ${validationErrors.amount ? 'input-error' : ''}`}
                                        required
                                        step="0.01"
                                        min="0"
                                    />
                                    {validationErrors.amount && <p className="error-message">{validationErrors.amount}</p>}
                                </div>
                                {/* Payment Date */}
                                <div className="form-group">
                                    <label htmlFor="salaryPaymentDate">Payment Date</label>
                                    <input
                                        type="date"
                                        id="salaryPaymentDate"
                                        name="payment_date"
                                        value={salaryFormData.payment_date}
                                        onChange={handleSalaryChange}
                                        className={`form-input ${validationErrors.payment_date ? 'input-error' : ''}`}
                                        required
                                    />
                                    {validationErrors.payment_date && <p className="error-message">{validationErrors.payment_date}</p>}
                                </div>
                                {/* Payment Method */}
                                <div className="form-group">
                                    <label htmlFor="salaryPaymentMethod">Payment Method</label>
                                    <select
                                        id="salaryPaymentMethod"
                                        name="payment_method"
                                        value={salaryFormData.payment_method}
                                        onChange={handleSalaryChange}
                                        className={`form-select ${validationErrors.payment_method ? 'input-error' : ''}`}
                                        required
                                    >
                                        <option value="">Select Method</option>
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="jazzcash">JazzCash</option>
                                        <option value="easypaisa">EasyPaisa</option>
                                        <option value="cheque">Cheque</option>
                                    </select>
                                    {validationErrors.payment_method && <p className="error-message">{validationErrors.payment_method}</p>}
                                </div>
                                {/* Reference Number */}
                                <div className="form-group">
                                    <label htmlFor="salaryReferenceNumber">Reference Number (Optional)</label>
                                    <input
                                        type="text"
                                        id="salaryReferenceNumber"
                                        name="reference_number"
                                        value={salaryFormData.reference_number}
                                        onChange={handleSalaryChange}
                                        className="form-input"
                                    />
                                </div>
                                {/* Notes */}
                                <div className="form-group form-group-full">
                                    <label htmlFor="salaryNotes">Notes (Optional)</label>
                                    <textarea
                                        id="salaryNotes"
                                        name="notes"
                                        value={salaryFormData.notes}
                                        onChange={handleSalaryChange}
                                        rows="3"
                                        className="form-textarea"
                                    ></textarea>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="button button-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="button button-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (isEditSalary ? 'Update Payment' : 'Record Payment')}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'delete_salary': // New: Salary Delete Modal
                return (
                    <div className={modalContentClasses}>
                        <button
                            onClick={closeModal}
                            className="modal-close-button"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                        <div className="delete-modal-content">
                            <h2 className="modal-title">Confirm Salary Deletion</h2>
                            <p className="modal-text">
                                Are you sure you want to delete the salary payment for{' '}
                                <span className="employee-name">{selectedSalaryPayment?.employee_name}</span> (ID:{' '}
                                {selectedSalaryPayment?.system_employee_id}) for{' '}
                                <span className="payment-period">
                                    {getMonthName(selectedSalaryPayment?.salary_month)} {selectedSalaryPayment?.salary_year}
                                </span>?
                                This action cannot be undone.
                            </p>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="button button-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteSalary}
                                    className="button button-danger"
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'export_pdf_dates': // Expense PDF Export Date Selection Modal
                return (
                    <div className={modalContentClasses}>
                        <button
                            onClick={closeModal}
                            className="modal-close-button"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                        <form onSubmit={handleExportPdf} className="modal-form">
                            <h2 className="modal-title">Generate Expense Report (PDF)</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="reportStartDate">Start Date</label>
                                    <input
                                        type="date"
                                        id="reportStartDate"
                                        name="startDate"
                                        value={reportDates.startDate}
                                        onChange={handleReportDatesChange}
                                        className={`form-input ${validationErrors.startDate ? 'input-error' : ''}`}
                                        required
                                    />
                                    {validationErrors.startDate && <p className="error-message">{validationErrors.startDate}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="reportEndDate">End Date</label>
                                    <input
                                        type="date"
                                        id="reportEndDate"
                                        name="endDate"
                                        value={reportDates.endDate}
                                        onChange={handleReportDatesChange}
                                        className={`form-input ${validationErrors.endDate ? 'input-error' : ''}`}
                                        required
                                    />
                                    {validationErrors.endDate && <p className="error-message">{validationErrors.endDate}</p>}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="button button-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="button button-primary" disabled={loading}>
                                    {loading ? 'Generating...' : 'Generate Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            case 'export_salary_pdf': // New: Salary PDF Export Modal
                return (
                    <div className={modalContentClasses}>
                        <button
                            onClick={closeModal}
                            className="modal-close-button"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                        <form onSubmit={handleExportSalaryPdf} className="modal-form">
                            <h2 className="modal-title">Generate Salary Report (PDF)</h2>
                            <div className="form-grid">
                                <div className="form-group form-group-full">
                                    <label htmlFor="salaryReportEmployeeId">Employee</label>
                                    <select
                                        id="salaryReportEmployeeId"
                                        name="id"
                                        value={salaryReportData.id}
                                        onChange={handleSalaryReportDataChange}
                                        className={`form-select ${validationErrors.id ? 'input-error' : ''}`}
                                        required
                                    >
                                        <option value="">Select an Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.firstName} {emp.lastName} (ID: {emp.id})
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.id && <p className="error-message">{validationErrors.id}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="salaryReportMonth">Month</label>
                                    <select
                                        id="salaryReportMonth"
                                        name="month"
                                        value={salaryReportData.month}
                                        onChange={handleSalaryReportDataChange}
                                        className={`form-select ${validationErrors.month ? 'input-error' : ''}`}
                                        required
                                    >
                                        <option value="">Select Month</option>
                                        {[...Array(12).keys()].map(i => (
                                            <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>
                                        ))}
                                    </select>
                                    {validationErrors.month && <p className="error-message">{validationErrors.month}</p>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="salaryReportYear">Year</label>
                                    <input
                                        type="number"
                                        id="salaryReportYear"
                                        name="year"
                                        value={salaryReportData.year}
                                        onChange={handleSalaryReportDataChange}
                                        className={`form-input ${validationErrors.year ? 'input-error' : ''}`}
                                        required
                                        min="2000" // Adjust as needed
                                        max={new Date().getFullYear() + 5} // Adjust as needed
                                    />
                                    {validationErrors.year && <p className="error-message">{validationErrors.year}</p>}
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="button button-secondary">
                                    Cancel
                                </button>
                                <button type="submit" className="button button-primary" disabled={loading}>
                                    {loading ? 'Generating...' : 'Generate Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                );
            default:
                return null;
        }
    };


    if (loading && !payments.length && !expenses.length && !salaryPayments.length && !error) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p className="loading-text">Loading finance data...</p>
            </div>
        );
    }

    if (error && !payments.length && !expenses.length && !salaryPayments.length) {
        return (
            <div className="error-container">
                <AlertCircle size={48} className="error-icon" />
                <p className="error-message-large">Error: {error}</p>
                <button
                    onClick={() => { fetchPayments(); fetchProjects(); fetchClients(); fetchExpenses(); fetchUsers(); fetchSalaryPayments(); fetchEmployees(); }}
                    className="button button-primary"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="finance-management-container">
            <h1 className="main-title">Finance Management</h1>

            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast-notification ${toast.type === 'success' ? 'toast-success' : 'toast-error'} ${toast.show ? 'toast-show' : ''}`}>
                    {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{toast.message}</span>
                    <button onClick={() => setToast({ ...toast, show: false })} className="toast-close-button">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Payment Records Section */}
            <div className="section-header-with-button">
                <h2 className="section-title">Payment Records</h2>
                <button
                    onClick={() => openModal('create_payment')}
                    className="button button-primary add-payment-button"
                >
                    <Plus size={20} className="button-icon" /> Record New Payment
                </button>
            </div>

            {payments.length === 0 && !loading && !error && !(modalMode.includes('payment')) ? (
                <div className="no-data-found">
                    <p>No payment records found. Click "Record New Payment" to get started!</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="table-header">Payment ID</th>
                                <th className="table-header">Project</th>
                                <th className="table-header">Client</th>
                                <th className="table-header">Amount Paid</th>
                                <th className="table-header">Date</th>
                                <th className="table-header">Method</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Reference</th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment.id} className="table-row">
                                    <td className="table-data font-medium">{payment.id}</td>
                                    <td className="table-data">{getProjectTitle(payment.project_id)}</td>
                                    <td className="table-data">{getClientName(payment.client_id)}</td>
                                    <td className="table-data">${parseFloat(payment.paidAmount).toLocaleString()}</td>
                                    <td className="table-data">
                                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="table-data capitalize">{payment.payment_method.replace(/_/g, ' ')}</td>
                                    <td className="table-data">
                                        <span className={`status-badge status-${payment.payment_status}`}>
                                            {payment.payment_status}
                                        </span>
                                    </td>
                                    <td className="table-data">{payment.reference_number || 'N/A'}</td>
                                    <td className="table-data table-actions">
                                        <div className="action-buttons-group">
                                            <button
                                                onClick={() => openModal('edit_payment', payment)}
                                                className="action-button edit-button"
                                                title="Edit Payment"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => openModal('delete_payment', payment)}
                                                className="action-button delete-button"
                                                title="Delete Payment"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            {payment.invoice_file && (
                                                <a
                                                    href={payment.invoice_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="action-button button-secondary"
                                                    title="View Invoice"
                                                >
                                                    <FileText size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Expense Management Section */}
            <div className="section-header-with-button" style={{ marginTop: '3rem' }}>
                <h2 className="section-title">Expense Records</h2>
                <div className="expense-buttons-group"> {/* New div for grouping buttons */}
                    <button
                        onClick={() => openModal('create_expense')}
                        className="button button-primary add-expense-button"
                    >
                        <Plus size={20} className="button-icon" /> Record New Expense
                    </button>
                    <button
                        onClick={() => openModal('export_pdf_dates')} 
                        className="button  export-pdf-button"
                    >
                        <Download size={20} className="button-icon" /> Export PDF Report
                    </button>
                </div>
            </div>

            {expenses.length === 0 && !loading && !error && !(modalMode.includes('expense')) ? (
                <div className="no-data-found">
                    <p>No expense records found. Click "Record New Expense" to get started!</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="table-header">Expense ID</th>
                                <th className="table-header">Category</th>
                                <th className="table-header">Description</th>
                                <th className="table-header">Amount</th>
                                <th className="table-header">Date</th>
                                <th className="table-header">Method</th>
                                <th className="table-header">Approved By</th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense) => (
                                <tr key={`${expense.id}-${expense.expense_date}-${expense.description}`} className="table-row">
                                    <td className="table-data font-medium">{expense.id}</td>
                                    <td className="table-data capitalize">{expense.category.replace(/_/g, ' ')}</td>
                                    <td className="table-data">{expense.description}</td>
                                    <td className="table-data">${parseFloat(expense.amount).toLocaleString()}</td>
                                    <td className="table-data">
                                        {expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="table-data capitalize">{expense.payment_method.replace(/_/g, ' ')}</td>
                                    <td className="table-data">{getUserName(expense.approved_by)}</td> {/* Display user's name */}
                                    <td className="table-data table-actions">
                                        <div className="action-buttons-group">
                                            <button
                                                onClick={() => openModal('edit_expense', expense)}
                                                className="action-button edit-button"
                                                title="Edit Expense"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => openModal('delete_expense', expense)}
                                                className="action-button delete-button"
                                                title="Delete Expense"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            {expense.receipt_file && (
                                                <a
                                                    href={expense.receipt_file}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="action-button button-secondary"
                                                    title="View Receipt"
                                                >
                                                    <FileText size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* New: Salary Management Section */}
            <div className="section-header-with-button" style={{ marginTop: '3rem' }}>
                <h2 className="section-title">Salary Records</h2>
                <div className="salary-buttons-group"> {/* New div for grouping buttons */}
                    <button
                        onClick={() => openModal('create_salary')}
                        className="button button-primary add-salary-button"
                    >
                        <Plus size={20} className="button-icon" /> Record New Salary Payment
                    </button>
                    <button
                        onClick={() => openModal('export_salary_pdf')} 
                        className="button export-pdf-button"
                    >
                        <Download size={20} className="button-icon" /> Export Salary PDF
                    </button>
                </div>
            </div>

            {salaryPayments.length === 0 && !loading && !error && !(modalMode.includes('salary')) ? (
                <div className="no-data-found">
                    <p>No salary records found. Click "Record New Salary Payment" to get started!</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="table-header">Payment ID</th>
                                <th className="table-header">Employee Name</th>
                                <th className="table-header">Employee ID</th>
                                <th className="table-header">Designation</th>
                                <th className="table-header">Month/Year</th>
                                <th className="table-header">Amount</th>
                                <th className="table-header">Payment Date</th>
                                <th className="table-header">Method</th>
                                <th className="table-header">Reference</th>
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaryPayments.map((payment) => (
                                <tr key={payment.id} className="table-row">
                                    <td className="table-data font-medium">{payment.id}</td>
                                    {/* Using employee_name and designation directly from API response for now,
                                        but if these are not consistently provided by /salary/all,
                                        you'd need to map them from the 'employees' state */}
                                    <td className="table-data">{payment.employee_name || getEmployeeName(payment.employee_id)}</td>
                                    <td className="table-data">{payment.system_employee_id || getSystemEmployeeId(payment.employee_id)}</td>
                                    <td className="table-data">{payment.designation || 'N/A'}</td> {/* Assuming designation might not be in salary API */}
                                    <td className="table-data">{getMonthName(payment.salary_month)} {payment.salary_year}</td>
                                    <td className="table-data">${parseFloat(payment.amount).toLocaleString()}</td>
                                    <td className="table-data">
                                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="table-data capitalize">{payment.payment_method.replace(/_/g, ' ')}</td>
                                    <td className="table-data">{payment.reference_number || 'N/A'}</td>
                                    <td className="table-data table-actions">
                                        <div className="action-buttons-group">
                                            <button
                                                onClick={() => openModal('edit_salary', payment)}
                                                className="action-button edit-button"
                                                title="Edit Payment"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => openModal('delete_salary', payment)}
                                                className="action-button delete-button"
                                                title="Delete Payment"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Overlay */}
            {showModal && (
                <div className="modal-overlay">
                    {renderModalContent()}
                </div>
            )}
        </div>
    );
}
