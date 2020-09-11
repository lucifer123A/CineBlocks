import React, {useState, useEffect} from 'react'
import Modal from 'react-bootstrap/Modal'
import Spinner from 'react-bootstrap/Spinner'
import './modal.css'

export default function UpdatesModal(props) {

    const {modal, setModal, web3, instance} = props.passableProps
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState()

    useEffect(() => {
        if(!data && instance) {
            getData()
        }
    }, [])

    const getData = async () => {
        let d = []
        let c
        let n = await instance.methods.updateCount().call()
        if(parseInt(n) !== 0){
            for(let i=0; i < parseInt(n); i++) {
                c = await instance.methods.updates(i).call()
                d.push(c)
            }
            setData(d)
        }
        else {
            setData(['No updates found.'])
        }
        setLoading(false)
    }
    
    const main = () => (
        <div className='updatesDiv'>
            {data.map((item, index) => (
                <div key={index}>
                <div></div>
                    <div className='time'>{item.slice(0, item.indexOf(']')+1)}</div>
                    <div className='message'>{item.slice(item.indexOf(']')+1)}</div>
                    <br /> <br />
                </div>
            ))}
        </div>
    )
    
    return (
        <Modal
            show={modal}
            onHide={() => setModal(false)}
            // dialogClassName="modal-90w"
            size='lg'
            aria-labelledby="example-custom-modal-styling-title"
            centered
            className='main'
        >
        <Modal.Header className='header' closeButton>
          <Modal.Title id="example-custom-modal-styling-title" className='title'>
            Recent Updates
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className='body'>
            {loading ? <Spinner variant='light' animation="border" className='loader'/> : main()}
        </Modal.Body>
      </Modal>
    )
}
