import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.scss';

import { useState } from 'react';
import { promises as fs } from 'fs'
import path from 'path'
import getConfig from 'next/config'

export default function Home(props) {
  const [trips, setTrips] = useState(props.tripSet); //assign to state
  const [checked, setChecked] = useState(true); //assign to state
  const [filter, setFilter] = useState(['all_vacations']);
  const options = props.tripTypes;

  const handleSort = (type, data) => {
    const sortedData = [...data].sort((a,b) => {
      if(type == 'checkinAccd') {
        return new Date(a.checkInDate) - new Date(b.checkInDate)
      } else if(type == 'checkinDesc') {
        return new Date(b.checkInDate) - new Date(a.checkInDate)
      }
    })
    setTrips(sortedData)
  };

  const handleChange = () => {
    setChecked(!checked);
    if(!checked) {
      handleSort('checkinAccd', trips)
    } else {
      handleSort('checkinDesc', trips)
    }
  };

  const handleChangeFilter = (event) => {
    //set select
    const optionsUp = [...event.target.options]
      .filter(option => option.selected)
      .map(x => x.value);
      
    setFilter(optionsUp);

    //set trips
    var newArray = []; 

    if(optionsUp.includes('all_vacations')) {  //dont set anything further
      setFilter(['all_vacations']); //reset
      setChecked(true);
      setTrips(props.tripSet); //reset
    } else {      
      optionsUp.map((option) => {
        var tempArray = props.tripSet.filter(trip => formatNoSpaces(trip.unitStyleName) === option);
        newArray = newArray.concat(tempArray);
      });

      //sort newArray
      let sortedTrips = [];
      if(!checked) {
        sortedTrips = newArray.sort((a,b) => { return new Date(b.checkInDate) - new Date(a.checkInDate) });
      } else {
        sortedTrips = newArray.sort((a,b) => { return new Date(a.checkInDate) - new Date(b.checkInDate) });
      }  

      setTrips(sortedTrips)      
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Roger Marshall&#39;s App</title>
        <meta name="description" content="POC of Trips display" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Trips POC</h1>

        <p className={styles.description}>
          View the list of trips and sort as nessasary.  
        </p>

        <div className="container">
          <div className="row justify-content-center">
            <div className="col-5 col-md-4 col-lg-3 my-3">
              <div className="col form-check form-switch mt-1">
                <input className="form-check-input" onChange={handleChange} checked={checked} type="checkbox" role="switch" id="sortOrder"/>
                <label className="form-check-label" htmlFor="sortOrder">Sort Descending</label>
              </div>    
            </div>
            <div className="col-7 col-md-6 col-lg-3 my-3">
              
              <select 
                size={options.length}
                onChange={handleChangeFilter}
                value={filter}
                options={options}                
                className="form-select" 
                multiple 
                aria-label="multiple select"
              >

                {options.map(item => (
                  <option value={item.value} key={item.value}>{item.label}</option>
                ))}
                
              </select>

            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-md-10 col-xl-10">

              {listTrips(trips)}

            </div>
          </div>

        </div>

      </main>

      <footer className={styles.footer}>
        by Roger Marshall
      </footer>
    </div>
  )
}

export async function getStaticProps() {
  //read from file
  const filePath = path.join(process.cwd(), 'data/trips.json');
  const jsonData = await fs.readFile(filePath);
  const objectData = JSON.parse(jsonData);

  //format select options
  let tripOptions = [];
  for(var i in objectData.styles) {
    const newKey = formatNoSpaces(objectData.styles[i]);
    tripOptions.push({
      "label" : objectData.styles[i],
      "value": newKey
    });
  }

  //initial sort by checkInDate
  const sortedTrips = objectData.tripSet.sort((a,b) => { return new Date(a.checkInDate) - new Date(b.checkInDate) });

  return {
    props: {
      "dates": objectData.dates,
      "destinations": objectData.destinations,
      "tripSet": sortedTrips,
      "tripTypes": tripOptions
    }
  }   
}

function formatDate(dateString) {
  var options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString([],options);
}

function formatNoSpaces(option) {
  return option.toLowerCase().replace(/ /g, '_');
}

function listTrips(obj) {
  if(!obj) { return 'missing trips' }
  const { publicRuntimeConfig } = getConfig()
  let content = [], columns = [];

  obj.forEach ((trip, i) => {
    //build the columns
    columns.push(
      <div key={i} className="col">
        <div className="card">
          <div className='card-img-top'>
          <Image
            alt={trip.unitName + ', ' + trip.locationName}
            src={`${publicRuntimeConfig.cmsUrl + trip.heroImage}`}
            layout="responsive"
            width={540}
            height={360}
            priority={i < 9? true : false}
          />
          </div>
          <div className="card-body">
            <h4 className={styles.cardtitle}>{trip.unitName}</h4>
            <p className={styles.cardtext}>
              <span>Type:</span> {trip.unitStyleName}
            </p>
            <p className={styles.cardtext}>
              <span>Check-in Date:</span> {formatDate(trip.checkInDate)}
            </p>
          </div>
        </div>  
      </div>
    );

    //push conditional rows 
    if((i+1) % 4 === 0) {
      content.push(<div key ={i} className ="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4 mb-4">{columns}</div>);
      columns = [];
    }
  });

  return content;
}