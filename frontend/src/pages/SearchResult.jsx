import React, {useState} from 'react'
import CommonSecction from './../shared/CommonSection'
import { Container, Row, Col } from 'reactstrap'
import { useLocation } from 'react-router-dom'
import TourCard from './../shared/TourCard'

const SearchResult = () => {
  const location = useLocation();
  const [data] = useState(location.state);
  // console.log(data);

  return (
    <>
      <CommonSecction title=" Tour Search Result" />
      <section>
        <Container>
          <Row>
            {
              data.length === 0 ? 
                <h4 className='text-center'>No Tour Found</h4>
               : 
                data?.map(tour =>
                 
                    <Col lg='3' className='mb-4' key={tour._id}>
                      <TourCard tour={tour} />
                    </Col>
                  
                )
              
            }
          </Row>
        </Container>
      </section>
    </>
  );
}

export default SearchResult;
