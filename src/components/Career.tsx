import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container" id="education">
      <div className="career-container">
        <h2>Education</h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech</h4>
                <h5>Shoolini University</h5>
              </div>
              <h3>2029</h3>
            </div>
            <p>B.Tech student, expected graduation in 2029.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
