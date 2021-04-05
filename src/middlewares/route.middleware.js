export default class RouteMiddleware {

    static invalidRoute( req ,res ) {
        res.status(404).send({ error: 'Invalid route' });
    }

}