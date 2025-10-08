const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database connection - Works with both Docker and local setup
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Change for local setup
  database: process.env.DB_NAME || 'law_department'
});

// Connect to database with retry logic (useful for Docker)
function connectWithRetry() {
  db.connect((err) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
      console.log('⏳ Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
      return;
    }
    console.log('✅ Connected to MySQL database');
    initializeDatabase();
  });
}

connectWithRetry();

// Initialize database (create table if not exists)
function initializeDatabase() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS cases (
      id INT AUTO_INCREMENT PRIMARY KEY,
      case_by_or_against VARCHAR(50),
      allocation_code VARCHAR(100),
      loan_no VARCHAR(100),
      customer_name VARCHAR(100) NOT NULL,
      complainant_name VARCHAR(100),
      claim_amount VARCHAR(50),
      contingent_amount VARCHAR(50),
      provision VARCHAR(50),
      risk_level VARCHAR(50),
      status VARCHAR(50) DEFAULT 'Live',
      division VARCHAR(100),
      product VARCHAR(100),
      location VARCHAR(100),
      state VARCHAR(100),
      region VARCHAR(100),
      nature VARCHAR(100),
      case_type VARCHAR(100),
      brief_details TEXT,
      case_no VARCHAR(100) UNIQUE,
      cnr_number VARCHAR(100),
      court_name VARCHAR(200),
      court_place VARCHAR(100),
      filing_date DATE,
      filing_year VARCHAR(10),
      last_date DATE,
      next_date DATE,
      present_status TEXT,
      advocate_name VARCHAR(100),
      advocate_mobile VARCHAR(20),
      advocate_email VARCHAR(100),
      fpr VARCHAR(100),
      rlm VARCHAR(100),
      rlm_email VARCHAR(100),
      documents_available VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error('❌ Error creating table:', err);
    } else {
      console.log('✅ Cases table is ready');
    }
  });
}

// ==================== API ROUTES ====================

// 1. Add new case
app.post('/api/cases', (req, res) => {
  const caseData = req.body;
  
  const query = `INSERT INTO cases 
    (case_by_or_against, allocation_code, loan_no, customer_name, complainant_name,
     claim_amount, contingent_amount, provision, risk_level, status, division,
     product, location, state, region, nature, case_type, brief_details,
     case_no, cnr_number, court_name, court_place, filing_date, filing_year,
     last_date, next_date, present_status, advocate_name, advocate_mobile,
     advocate_email, fpr, rlm, rlm_email, documents_available) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    caseData.caseByOrAgainst, caseData.allocationCode, caseData.loanNo,
    caseData.customerName, caseData.complainantName, caseData.claimAmount,
    caseData.contingentAmount, caseData.provision, caseData.riskLevel,
    caseData.status, caseData.division, caseData.product, caseData.location,
    caseData.state, caseData.region, caseData.nature, caseData.caseType,
    caseData.briefDetails, caseData.caseNo, caseData.cnrNumber,
    caseData.courtName, caseData.courtPlace, caseData.filingDate,
    caseData.filingYear, caseData.lastDate, caseData.nextDate,
    caseData.presentStatus, caseData.advocateName, caseData.advocateMobile,
    caseData.advocateEmail, caseData.fpr, caseData.rlm, caseData.rlmEmail,
    caseData.documentsAvailable
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error adding case:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error adding case', 
        error: err.message 
      });
      return;
    }
    res.json({ 
      success: true, 
      message: 'Case added successfully', 
      id: result.insertId 
    });
  });
});

// 2. Get all cases
app.get('/api/cases', (req, res) => {
  const query = 'SELECT * FROM cases ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching cases:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching cases' 
      });
      return;
    }
    res.json({ 
      success: true, 
      cases: results 
    });
  });
});

// 3. Search cases
app.get('/api/cases/search', (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    res.status(400).json({ 
      success: false, 
      message: 'Search query is required' 
    });
    return;
  }

  const searchQuery = `SELECT * FROM cases 
    WHERE case_no LIKE ? 
    OR customer_name LIKE ? 
    OR complainant_name LIKE ?
    ORDER BY created_at DESC`;
  
  const searchTerm = `%${query}%`;
  
  db.query(searchQuery, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error('Error searching cases:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error searching cases' 
      });
      return;
    }
    res.json({ 
      success: true, 
      cases: results 
    });
  });
});

// 4. Get case by ID
app.get('/api/cases/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('SELECT * FROM cases WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching case:', err);
      res.status(404).json({ 
        success: false, 
        message: 'Case not found' 
      });
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Case not found' 
      });
      return;
    }
    
    res.json({ 
      success: true, 
      case: results[0] 
    });
  });
});

// 5. Get case by case number
app.get('/api/cases/number/:caseNo', (req, res) => {
  const caseNo = req.params.caseNo;
  
  db.query('SELECT * FROM cases WHERE case_no = ?', [caseNo], (err, results) => {
    if (err) {
      console.error('Error fetching case:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error fetching case' 
      });
      return;
    }
    
    if (results.length === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Case not found' 
      });
      return;
    }
    
    res.json({ 
      success: true, 
      case: results[0] 
    });
  });
});

// 6. Update case
app.put('/api/cases/:id', (req, res) => {
  const { id } = req.params;
  const caseData = req.body;

  const query = `UPDATE cases SET 
    case_by_or_against=?, allocation_code=?, loan_no=?, customer_name=?,
    complainant_name=?, claim_amount=?, contingent_amount=?, provision=?,
    risk_level=?, status=?, division=?, product=?, location=?, state=?,
    region=?, nature=?, case_type=?, brief_details=?, case_no=?,
    cnr_number=?, court_name=?, court_place=?, filing_date=?, filing_year=?,
    last_date=?, next_date=?, present_status=?, advocate_name=?,
    advocate_mobile=?, advocate_email=?, fpr=?, rlm=?, rlm_email=?,
    documents_available=?
    WHERE id=?`;

  const values = [
    caseData.caseByOrAgainst, caseData.allocationCode, caseData.loanNo,
    caseData.customerName, caseData.complainantName, caseData.claimAmount,
    caseData.contingentAmount, caseData.provision, caseData.riskLevel,
    caseData.status, caseData.division, caseData.product, caseData.location,
    caseData.state, caseData.region, caseData.nature, caseData.caseType,
    caseData.briefDetails, caseData.caseNo, caseData.cnrNumber,
    caseData.courtName, caseData.courtPlace, caseData.filingDate,
    caseData.filingYear, caseData.lastDate, caseData.nextDate,
    caseData.presentStatus, caseData.advocateName, caseData.advocateMobile,
    caseData.advocateEmail, caseData.fpr, caseData.rlm, caseData.rlmEmail,
    caseData.documentsAvailable, id
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating case:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating case',
        error: err.message 
      });
      return;
    }
    
    if (result.affectedRows === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Case not found' 
      });
      return;
    }
    
    res.json({ 
      success: true, 
      message: 'Case updated successfully' 
    });
  });
});

// 7. Delete case
app.delete('/api/cases/:id', (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM cases WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting case:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting case' 
      });
      return;
    }
    
    if (result.affectedRows === 0) {
      res.status(404).json({ 
        success: false, 
        message: 'Case not found' 
      });
      return;
    }
    
    res.json({ 
      success: true, 
      message: 'Case deleted successfully' 
    });
  });
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'front.html'));
});

// Health check endpoint (useful for Docker)
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 Server running successfully!         ║
║   📍 URL: http://localhost:${PORT}        ║
║   📂 Database: law_department              ║
║   🐳 Docker: ${process.env.DB_HOST ? 'YES' : 'NO'}                           ║
╚════════════════════════════════════════════╝
  `);
});
