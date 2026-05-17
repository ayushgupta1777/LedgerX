import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from "./component/user_auth/PrivateRoute";
import { GoogleOAuthProvider } from '@react-oauth/google';

import Home from './component/Deposits/AC';
import Customer_form from './component/Deposits/Customer_form';
import Supplier_form from './component/Deposits/Supplier_form';
import Borrowed_Accounts from './component/Home/Borrowed_Accounts';
import Pf from './component/Deposits/profile';

import Otp from './component/user_auth/otp';
import Signup from './component/user_auth/signup';
import Login from './component/user_auth/Google_login';
import Auth from './component/user_auth/CombinedAuth';
import Forgetpassword from './component/user_auth/ForgotPassword';
import Header from './component/Home/header_button'


import Profile from './component/user_auth/profile';
import CDP1 from './component/Deposits/detail/CDP1';
import CDP20 from './component/look_by_customer/CDP2.0';
import TFP from './component/Deposits/detail/TFP';
import Home_d from './component/Deposits/home_d';

import Loans from './component/Loans/loan';
import Land_money_form from './component/Home/Customer_Form';
import Loan_form from './component/Loans/LoanForm';
import Loan_profile from './component/Loans/loan-profile';
import DetailPage from './component/Home/DetailPage';
import SignaturePage from './component/Loans/SignaturePage';
import Home_lone from './component/Loans/home_l';
import Transaction from './component/Loans/transaction';
import Customer_Profiles from './component/Loans/Profiles';
import  Receipt from './component/Loans/dynamics/ReceiptPage';
import Graph from './component/Loans/dynamics/graph';
import TopT from './component/Loans/dynamics/TopupTopdownChat';


import TakeLoanForm from './component/Take_loan/TakeLoanForm';
import LenderForm from './component/Take_loan/LenderForm';
import TakenLoanProfile from './component/Take_loan/TakenLoanProfile';
import TakenLoanHistory from './component/Take_loan/TakenLoanHistory';

import LendAccounts from './component/Home/Lend_Accounts';
import BorrowedAccounts from './component/Home/Borrowed_Accounts';
import LenderProfiles from './component/Take_loan/Lenderprofiles';

import WhatsAppStatement from './component/loan_despo/WhatsAppStatement';
import PrintableInvoice from './component/loan_despo/PrintableInvoice';

import LoanReminders from './component/Loans/dynamics/LoanReminders';


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
      
        <Route path='/login' element={
<GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <Login />
  </GoogleOAuthProvider>


        } />        <Route path='/signup' element={<Signup />} />
        <Route path='/auth' element={<Auth/>}/>
       
        <Route path='/otp' element={<Otp />} />
        <Route path='/forgot-password' element={<Forgetpassword/>}/>

        
        {/* Private Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Header />
            </PrivateRoute>
          }
        />
            <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home_lone />
            </PrivateRoute>
          }
        />
        <Route
          path="/ac"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/home_d"
          element={
            <PrivateRoute>
              <Home_d />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:customerId" element={
          <PrivateRoute><Pf/>
          </PrivateRoute>}
          />
                        <Route
          path="/borrowed-accounts"
          element={
            <PrivateRoute>
              <Borrowed_Accounts />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-customer"
          element={
            <PrivateRoute>
              <Customer_form />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-supplier"
          element={
            <PrivateRoute>
              <Supplier_form />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer/:customerID"
          element={
            <PrivateRoute>
              <CDP1 />
            </PrivateRoute>
          }
        />
        <Route
          path="/incuded-by/:customerID"
          element={
            <PrivateRoute>
              <CDP20 />
            </PrivateRoute>
          }
        />
        <Route
          path="/supplier/:supplierID"
          element={
            <PrivateRoute>
              <TFP />
            </PrivateRoute>
          }
        />
    
        <Route
          path="/land_money_form"
          element={
            <PrivateRoute>
              <Land_money_form />
            </PrivateRoute>
          }
        />
        <Route
          path="/transaction"
          element={
            <PrivateRoute>
              <Transaction />
            </PrivateRoute>
          }
        />
        <Route
          path="/customer_profiles"
          element={
            <PrivateRoute>
              <Customer_Profiles />
            </PrivateRoute>
          }
        />
        <Route
          path="/DetailPage/:customerID"
          element={
            <PrivateRoute>
              <DetailPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/loan_form/:customerID"
          element={
            <PrivateRoute>
              <Loan_form />
            </PrivateRoute>
          }
        />
        <Route
          path="/loan_profile/:customerID"
          element={
            <PrivateRoute>
              <Loan_profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-signature/:customerID"
          element={
            <PrivateRoute>
              <SignaturePage />
            </PrivateRoute>
          }
        />

<Route
          path="/receipt/:customerID"
          element={
            <PrivateRoute>
              <Receipt />
            </PrivateRoute>
          }
        />

        <Route
          path="/whatsapp-statement/:customerID"
          element={
            <PrivateRoute>
              <WhatsAppStatement />
            </PrivateRoute>
          }
        /> <Route
          path="/printable-invoice/:customerID"
          element={
            <PrivateRoute>
              <PrintableInvoice />
            </PrivateRoute>
          }
        />


        <Route
          path="/graph"
          element={
            <PrivateRoute>
              <Graph />
            </PrivateRoute>
          }
        />
        <Route
          path="/top-t/:customerID"
          element={
            <PrivateRoute>
              <TopT />
            </PrivateRoute>
          }
        />
        <Route
          path="/lenderform"
          element={
            <PrivateRoute>
              <LenderForm />
            </PrivateRoute>
          }
        />

                <Route
          path="/take_loan_form/:lenderID"
          element={
            <PrivateRoute>
              <TakeLoanForm />
            </PrivateRoute>
          }
        />
                        <Route
          path="/taken_loan_profile/:lenderID"
          element={
            <PrivateRoute>
              <TakenLoanProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/lend-accounts"
          element={
            <PrivateRoute>
              <LendAccounts />
            </PrivateRoute>
          }
        />
                <Route 
        path='/lender-profiles'
        element={
          <PrivateRoute>
            <LenderProfiles />
          </PrivateRoute>
        }
        />
        <Route path='/taken-loan-history/:lenderID' element={
          <PrivateRoute>
            <TakenLoanHistory />
          </PrivateRoute>
        } />

        <Route
          path="/loan-reminders"
          element={
            <PrivateRoute>
              <LoanReminders />
            </PrivateRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
