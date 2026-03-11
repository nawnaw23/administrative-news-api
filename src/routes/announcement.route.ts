import express from 'express';
import {
    createAnnouncement,
    getAllAnnouncements,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    uploadAnnouncementImage
} from '../controllers/announcement.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { uploadS3 } from '../middlewares/upload';

const announcementRouter = express.Router();

announcementRouter.post('/upload', isAuthenticated, authorizeRoles([1, 2, 3]), uploadS3.array('documentImages', 10), uploadAnnouncementImage);
announcementRouter.post('/', isAuthenticated, authorizeRoles([1, 2, 3]), uploadS3.array('documentImages', 10), createAnnouncement);
announcementRouter.get('/', getAllAnnouncements);
announcementRouter.get('/:id', getAnnouncementById);
announcementRouter.patch('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), uploadS3.array('documentImages', 10), updateAnnouncement);
announcementRouter.delete('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), deleteAnnouncement);

export default announcementRouter;
