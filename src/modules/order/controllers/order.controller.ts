import { Controller } from "@nestjs/common";

/**
 * Key features
 * 1. Create order [user]
 * 2. List order [user, admin, saler]
 * 3. List order for admin or saler
 * 4. Detail order (tracking order)
 * 5. Cacncel order [user_id, saler , admin]
 * 6. Update status order[saler , admin]
 */
@Controller("orders")
export class OrderController {}
