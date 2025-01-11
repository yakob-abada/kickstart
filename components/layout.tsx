import React from 'react'
import Head from './head'
import Footer from './footer'
import { Container } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

export default function Layout({ children }: {children: React.ReactNode}) {
    return (
        <Container>
            <Head />
            <main>{children}</main>
            <Footer />
        </Container>
    )
}