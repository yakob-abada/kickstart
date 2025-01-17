import React from 'react';
import Layout from "../../../components/layout";
import {Button, Header, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow} from "semantic-ui-react";
import Campaign from "../../../ehereum/campaign";
import Link from "next/link";
import web3 from "../../../ehereum/web3";

interface Request {
    id: number
    description: string
    value: number
    recipient: string
    complete: boolean
    approvalCount: number
}

interface Query {
    id: string
}

Page.getInitialProps = async ({query}: {query: Query}) => {
    const campaign = await Campaign(query.id);
    const requestCount = await campaign.methods.getRequestsCount().call();
    const approverCount = await campaign.methods.approverCount().call()
    const requests: Request[] = await Promise.all(Array(parseInt(requestCount)).fill(0).map(async (_, i) => {
        const result = await campaign.methods.requests(i).call()
        return {
            id: i,
            description: result[0],
            value: web3.utils.fromWei(result.value, 'ether').toString(),
            recipient: result.recipient,
            complete: result.complete,
            approvalCount: result.approvalCount.toString(),
        }
    }));

    return {
        campaignAdd: query.id,
        requests: requests,
        approverCount: approverCount.toString(),
    };
}

const approveRequest = async (e: React.MouseEvent<HTMLButtonElement>, campaignAdd: string, id: number) => {
    e.preventDefault();
    const accounts = await web3.eth.getAccounts();
    const campaign = await Campaign(campaignAdd);
    await campaign.methods.vote(id, true).send({from: accounts[0], gas: '1000000'});
}

const finalizeRequest = async (e: React.MouseEvent<HTMLButtonElement>, campaignAdd: string, id: number) => {
    e.preventDefault();
    const accounts = await web3.eth.getAccounts();
    const campaign = await Campaign(campaignAdd);
    await campaign.methods.finalizeRequest(id).send({from: accounts[0], gas: '1000000'});
}

const hasApproved = (approvalCount: number, approverCount: number) => {
    return approvalCount >= approverCount / 2;
}

const renderRows = (campaignAdd: string, requests: Request[], approverCount: number) => {
    return requests.map(request => {
        const approve = hasApproved(request.approvalCount, approverCount)
        return (
            <TableRow positive={request.complete}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.description}</TableCell>
                <TableCell>{request.value}</TableCell>
                <TableCell>{request.recipient}</TableCell>
                <TableCell>{request.approvalCount}/{approverCount}</TableCell>
                <TableCell>
                    {request.complete ?
                        '' :
                        <Button onClick={e  => approveRequest(e, campaignAdd, request.id)}>Approve</Button>
                    }
                </TableCell>
                <TableCell>
                    {request.complete ?
                        'Complete':
                        <Button color='teal' basic onClick={ e => finalizeRequest(e, campaignAdd, request.id)}>Finalize</Button>}
                </TableCell>
            </TableRow>
        )
    })
}

export default function Page (
    {campaignAdd, requests, approverCount}: {campaignAdd: string, requests: Request[], approverCount: number}
) {
    return (
        <Layout>
            <Link href={`/campaigns/${campaignAdd}/requests/new`}>
                <Button primary icon='item' content='New Rquest'/>
            </Link>
            <Header as='h3'>Request list for {campaignAdd}</Header>
            <Table celled selectable>
                <TableHeader>
                    <TableRow>
                        <TableHeaderCell>ID</TableHeaderCell>
                        <TableHeaderCell>Description</TableHeaderCell>
                        <TableHeaderCell>Amount (ether)</TableHeaderCell>
                        <TableHeaderCell>Recipient</TableHeaderCell>
                        <TableHeaderCell>Approval counts</TableHeaderCell>
                        <TableHeaderCell>Approve</TableHeaderCell>
                        <TableHeaderCell>Finalize</TableHeaderCell>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {renderRows(campaignAdd, requests, approverCount)}
                </TableBody>
            </Table>
        </Layout>
    );
}