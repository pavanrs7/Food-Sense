import { Container, Row, Col, Card } from "react-bootstrap";
import BarcodeScanner from "../components/barcode/BarcodeScanner";
import Sidebar from "../components/layout/Sidebar";
import "../components/barcode/BarcodeScanner.css";

const BarcodeScannerPage = () => {
  return (
    <div className="d-flex page-container">
      <Sidebar />
      <div className="content-area">
        <Container className="py-5">
          <div className="page-header mb-5">
            <h1 className="text-center">Food Product Scanner</h1>
            <p className="lead text-center">
              Scan food product barcodes to check nutritional information and
              find healthier alternatives
            </p>
          </div>

          <div className="scanner-intro mb-5">
            <Row className="align-items-center">
              <Col md={6}>
                <div className="scanner-info">
                  <h3>Why Use Our Food Scanner?</h3>
                  <ul className="feature-list">
                    <li>
                      <i className="fas fa-check-circle text-success"></i>
                      <span>Instantly check nutritional information</span>
                    </li>
                    <li>
                      <i className="fas fa-check-circle text-success"></i>
                      <span>Discover healthier food alternatives</span>
                    </li>
                    <li>
                      <i className="fas fa-check-circle text-success"></i>
                      <span>Make informed dietary choices</span>
                    </li>
                    <li>
                      <i className="fas fa-check-circle text-success"></i>
                      <span>Identify allergens and ingredients</span>
                    </li>
                  </ul>
                </div>
              </Col>
            </Row>
          </div>

          <div className="how-it-works mb-5">
            <h3 className="text-center mb-4">How It Works</h3>
            <Row>
              <Col md={3}>
                <div className="step-card">
                  <div className="step-number">1</div>
                  <div className="step-icon">
                    <i className="fas fa-barcode"></i>
                  </div>
                  <h5>Scan Barcode</h5>
                  <p>Use your camera to scan a food product barcode</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="step-card">
                  <div className="step-number">2</div>
                  <div className="step-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <h5>Analyze Product</h5>
                  <p>We fetch and analyze the nutritional information</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="step-card">
                  <div className="step-number">3</div>
                  <div className="step-icon">
                    <i className="fas fa-chart-pie"></i>
                  </div>
                  <h5>View Details</h5>
                  <p>See detailed nutritional breakdown and health score</p>
                </div>
              </Col>
              <Col md={3}>
                <div className="step-card">
                  <div className="step-number">4</div>
                  <div className="step-icon">
                    <i className="fas fa-exchange-alt"></i>
                  </div>
                  <h5>Find Alternatives</h5>
                  <p>Discover healthier alternative products</p>
                </div>
              </Col>
            </Row>
          </div>

          <Card className="mb-5 shadow-sm">
            <Card.Body>
              <BarcodeScanner />
            </Card.Body>
          </Card>

          <div className="scanner-tips mt-5 mb-5">
            <h3 className="text-center mb-4">Tips for Better Scanning</h3>
            <Row>
              <Col md={4}>
                <div className="tip-card">
                  <div className="tip-icon">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <h5>Good Lighting</h5>
                  <p>Ensure the barcode is well-lit for better detection</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="tip-card">
                  <div className="tip-icon">
                    <i className="fas fa-hand-paper"></i>
                  </div>
                  <h5>Hold Steady</h5>
                  <p>Keep your device steady while scanning the barcode</p>
                </div>
              </Col>
              <Col md={4}>
                <div className="tip-card">
                  <div className="tip-icon">
                    <i className="fas fa-keyboard"></i>
                  </div>
                  <h5>Manual Entry</h5>
                  <p>If scanning fails, try entering the barcode manually</p>
                </div>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default BarcodeScannerPage;
