import { Container } from "react-bootstrap";
import Sidebar from "../components/layout/Sidebar";
import PandaBot from "../components/PandaBot/PandaBot";

const PandaBotPage = () => {
  return (
    <div className="d-flex page-container">
      <Sidebar />
      <div className="content-area">
        <Container className="py-5">
          <div className="page-header mb-4">
            <h1 className="text-center">Panda Bot</h1>
            <p className="lead text-center">
              Your AI-powered nutrition assistant
            </p>
          </div>

          <PandaBot />
        </Container>
      </div>
    </div>
  );
};

export default PandaBotPage;
