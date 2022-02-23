import Head from 'next/head'
import { useState, useEffect } from 'react';
import Profile from "../components/Profile";
import clientPromise from '../../lib/mongodb'
import Link from 'next/link'
import Foods from "../components/Foods";
import Dates from "../components/Dates";
import log from "tailwindcss/lib/util/log";
import "tailwindcss/tailwind.css"
import { server } from '../../config';
import {render} from "react-dom";
import dates from "../components/Dates";

function MovieDetails({ personName, personOfDate, receiptOfDate, date}) {





    return (
        <>
            <div>
                <div className="bg-blue-700 grid place-items-center grid-cols-5 gap-5 justify-items-center p-2 bg-gray-200 max-w">
                    <button className={"bg-blue-600 font-semibold text-center rounded-3xl border shadow-lg p-2 max-w-xs"}>
                        {/*<Link href={`http://localhost:3000/food/${person.name}`}>*/}
                        <Link href={`/food/${personName}`} scroll={false}>

                            <h1>
                                Back to all Dates
                            </h1>
                        </Link>
                    </button>
                    <p></p>
                    {/*{console.log(personCollectionOfDate.totalPrice)}*/}
                    <Profile name={personName} moneyOwed={personOfDate.totalPrice}/>
                    <p></p>
                    {/*<button className={"bg-blue-300 font-semibold text-center rounded-3xl border shadow-lg p-2 "}>*/}
                    {/*    <h1 className={"font-bold"}>*/}
                    {/*        Refresh*/}
                    {/*    </h1>*/}
                    {/*    <p className={"text-sm"}>(Click refresh to make sure all <br/>information is accurate)</p>*/}

                    {/*</button>*/}
                </div>
                <div className="grid place-items-center grid-cols-3 gap-1 justify-items-center p-2 bg-gray-200 max-w">


                    {receiptOfDate && receiptOfDate.map(item => (
                        <>
                            <div>
                                <Foods foodName={item.foodName} foodPrice={item.foodPrice} personName={personName} buy={JSON.parse(JSON.stringify(item.buy)).includes(personName)} date={personOfDate.date} totalPeople={item.totalPeople} img={item.img}/>
                            </div>
                        </>
                    ))}

                </div>

            </div>

        </>
    );
}


export async function getServerSideProps(context) {
    const client = await clientPromise
    const entireDB = await client.db("grocery-app");

    const personName = context.query.date_id[0];
    const date = context.query.date_id[1];

    const collectionReceipt = await entireDB.collection(date)
    const collectionAllItemsOnReceipt = await collectionReceipt.find().toArray();
    const receiptOfDate = await JSON.parse(JSON.stringify(collectionAllItemsOnReceipt));

    const collectionPerson = await entireDB.collection(personName)
    const collectionPersonOfDate = await collectionPerson.findOne({date: date});
    const personOfDate = await JSON.parse(JSON.stringify(collectionPersonOfDate));


    let totalPrice = 0;

    function calculateTotal(otherPrice, flag, totalPeople) {
        if (flag) {
            totalPrice = Math.round(((otherPrice / totalPeople) + totalPrice) * 100) / 100

            console.log()
        }
    }


    {receiptOfDate && receiptOfDate.map(item => (
        <>
            {calculateTotal(item.foodPrice, JSON.parse(JSON.stringify(item.buy)).includes(personName), item.totalPeople)}
            {/*{item.totalPeople}*/}
            {/*{console.log(item.foodPrice)}*/}
        </>
    ))}

    const result = await client.db("grocery-app").collection(personName).updateOne({date: date}, { $set: {totalPrice: totalPrice}});

    return {
        props: { personName, personOfDate, receiptOfDate, date},
    }
}

export default MovieDetails;