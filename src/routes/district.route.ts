import express from 'express';
import {
    createDistrict,
    getAllDistricts,
    getDistrictById,
    updateDistrict,
    deleteDistrict
} from '../controllers/district.controller';
import { authorizeRoles, isAuthenticated } from '../middlewares/auth';
import { uploadS3 } from '../middlewares/upload';

const districtRouter = express.Router();

districtRouter.post('/', isAuthenticated, authorizeRoles([1, 2, 3]), uploadS3.single('coverImage'), createDistrict);
districtRouter.get('/', getAllDistricts);
districtRouter.get('/:id', getDistrictById);
districtRouter.patch('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), uploadS3.single('coverImage'), updateDistrict);
districtRouter.delete('/:id', isAuthenticated, authorizeRoles([1, 2, 3]), deleteDistrict);

export default districtRouter;
