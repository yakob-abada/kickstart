import React, {Component} from "react";
import factory from "../ehereum/factory";
import { Card, Button, Grid, GridColumn } from 'semantic-ui-react'
import Layout from '../components/layout'

class IndexPage extends Component {
    static async getInitialProps() {
        const campaigns = await factory.methods.getDeployedCampaigns().call();

        return {campaigns}
    }

    renderCards() {
        return this.props.campaigns.map((campaignAdd) => {
            return <Card fluid key={campaignAdd}
                href={`campaigns/${campaignAdd}`}
                header={campaignAdd}
            />
        })
    }

    render() {
        return (
            <Layout>
                <h3>Open Campaigns</h3>
                <Grid>
                    <GridColumn width={14}>
                        {this.renderCards()}
                    </GridColumn>
                    <GridColumn width={2}>
                        <Button href="/campaigns/new" primary icon='add' content='Add'/>
                    </GridColumn>
                </Grid>
            </Layout>
        )
    }
}

export default IndexPage;
