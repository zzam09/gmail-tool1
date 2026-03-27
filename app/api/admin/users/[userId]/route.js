import { db } from "@/lib/db";

export async function DELETE(req, { params }) {
  try {
    // In Next.js App Router, params might be a Promise
    const resolvedParams = await params;
    const userId = resolvedParams?.userId || resolvedParams?.['userId'];
    
    if (!userId || userId === 'undefined' || userId === '') {
      console.log('❌ No userId provided for deletion');
      return Response.json({ error: "No userId provided" }, { status: 400 });
    }

    console.log('🗑️ Deleting user with ID:', userId);

    // First get user info for confirmation
    const userToDelete = await db.findById(userId);
    if (!userToDelete) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Delete the user
    const deletedUser = await db.deleteById(userId);
    
    console.log('✅ User deleted successfully:', deletedUser.email);

    return Response.json({
      success: true,
      message: "User deleted successfully",
      deletedUser: {
        id: deletedUser.id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
  } catch (error) {
    console.error('❌ Failed to delete user:', error);
    return Response.json({ 
      error: "Failed to delete user", 
      details: error.message 
    }, { status: 500 });
  }
}
