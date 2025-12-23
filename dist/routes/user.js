"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const jwt_1 = require("../utils/jwt");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
/**
 * @openapi
 * /user/image:
 *   post:
 *     summary: Update user profile image
 *     description: Updates the authenticated user's profile image and returns a new JWT token with updated information
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - profile_image
 *             properties:
 *               profile_image:
 *                 type: string
 *                 description: URL or base64 string of the profile image
 *                 example: "https://example.com/images/profile.jpg"
 *     responses:
 *       200:
 *         description: Profile image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile image updated successfully"
 *                 token:
 *                   type: string
 *                   description: New JWT token with updated user information
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Profile image is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Profile image is required"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Something went wrong"
 */
router.post("/image", auth_1.default, async (req, res) => {
    try {
        const { profile_image } = req.body;
        if (!profile_image) {
            return res.status(400).json({ error: "Profile image is required" });
        }
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: req.user.userId },
            data: { profile_image },
        });
        const newToken = (0, jwt_1.generateJWT)({
            userId: updatedUser.id,
            email: updatedUser.email,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            profile_image: updatedUser.profile_image,
        });
        return res.json({
            message: "Profile image updated successfully",
            token: newToken,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});
/**
 * @openapi
 * /user/delete:
 *   delete:
 *     summary: Delete user account
 *     description: Permanently deletes the authenticated user's account.
 *     tags:
 *       - User Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Account deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Unauthorized"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Something went wrong"
 */
router.delete("/", auth_1.default, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
        });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        await prisma_1.default.user.delete({
            where: { id: req.user.userId },
        });
        return res.json({ message: "Account deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.default = router;
